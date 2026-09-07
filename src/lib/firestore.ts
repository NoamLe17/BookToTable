import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  increment,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Book, Order, User, FanMail } from '@/types';

// ==================== USERS ====================
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { id: docSnap.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function createUser(userId: string, data: Partial<User>): Promise<void> {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    stripeOnboarded: false,
    allowsFanMail: false,
    createdAt: Timestamp.now(),
  });
  // Notify admin
  await createAdminNotification({
    type: 'new_user',
    title: 'משתמש חדש נרשם',
    message: `${data.name || data.email || 'משתמש'} הצטרף לפלטפורמה`,
    entityId: userId,
    entityType: 'user',
  });
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), data as Record<string, unknown>);
}

// ==================== BOOKS ====================
export async function getBooks(limitCount = 20): Promise<Book[]> {
  try {
    // Query only published books directly in Firestore (no in-memory filtering)
    const q = query(
      collection(db, 'books'),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Book;
    });
  } catch (error) {
    console.error('Error fetching getBooks:', error);
    // Fallback: fetch all and filter (handles missing Firestore index)
    try {
      const q2 = query(
        collection(db, 'books'),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 3)
      );
      const snap2 = await getDocs(q2);
      const all = snap2.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Book;
      });
      return all.filter(b => b.isPublished).slice(0, limitCount);
    } catch (err2) {
      console.error('Fallback getBooks also failed:', err2);
      return [];
    }
  }
}

export async function getBestsellers(limitCount = 8): Promise<Book[]> {
  try {
    const q = query(
      collection(db, 'books'),
      where('isPublished', '==', true),
      orderBy('salesCount', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Book;
    });
  } catch (error) {
    console.error('Error fetching getBestsellers:', error);
    return [];
  }
}

export async function getBookById(bookId: string): Promise<Book | null> {
  const docRef = doc(db, 'books', bookId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Book;
  }
  return null;
}

export async function getBooksByAuthor(authorId: string): Promise<Book[]> {
  const q = query(
    collection(db, 'books'),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Book;
  });
}

export async function createBook(data: Omit<Book, 'id' | 'createdAt' | 'salesCount'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'books'), {
    ...data,
    salesCount: 0,
    createdAt: Timestamp.now(),
  });
  // Notify admin
  await createAdminNotification({
    type: 'new_book',
    title: 'ספר חדש הועלה',
    message: `"${data.title}" מאת ${data.authorName || 'סופר'} — עלה לאוויר`,
    entityId: docRef.id,
    entityType: 'book',
  });
  return docRef.id;
}

export async function updateBook(bookId: string, data: Partial<Book>): Promise<void> {
  await updateDoc(doc(db, 'books', bookId), data as Record<string, unknown>);
}

export async function deleteBook(bookId: string): Promise<void> {
  await deleteDoc(doc(db, 'books', bookId));
}

// ==================== ORDERS ====================
export async function createOrder(data: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...data,
    createdAt: Timestamp.now(),
  });

  // Increment the sales count of the purchased book
  if (data.bookId) {
    try {
      await updateDoc(doc(db, 'books', data.bookId), {
        salesCount: increment(data.quantity || 1)
      });
    } catch (e) {
      console.error('Failed to increment sales count:', e);
    }
  }

  // Notify admin
  await createAdminNotification({
    type: 'new_order',
    title: 'הזמנה חדשה התקבלה',
    message: `הזמנה עבור "${data.bookTitle || data.bookId}" על סך ₪${data.totalPaid}`,
    entityId: docRef.id,
    entityType: 'order',
  });

  return docRef.id;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const docRef = doc(db, 'orders', orderId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Order;
  }
  return null;
}

export async function getOrdersByAuthor(authorId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Order;
  });
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status });
}

export async function updateOrderTracking(orderId: string, trackingNumber: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { 
    status: 'shipped',
    trackingNumber 
  });
}

// ==================== FAN MAIL ====================
export async function createFanMail(data: Omit<FanMail, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'fan_mail'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  await updateDoc(doc(db, 'orders', data.orderId), { fanMailSent: true });
  return docRef.id;
}

export async function getFanMailByAuthor(authorId: string): Promise<FanMail[]> {
  const q = query(
    collection(db, 'fan_mail'),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as FanMail;
  });
}

// ==================== AUTHORS ====================
export async function getTrendingAuthors(limitCount = 6): Promise<User[]> {
  try {
    const q = query(
      collection(db, 'users'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as User;
    });
  } catch (error) {
    console.error('Error fetching getTrendingAuthors:', error);
    return [];
  }
}

// ==================== ADMIN NOTIFICATIONS ====================
export interface AdminNotification {
  id: string;
  type: 'new_user' | 'new_book' | 'new_order' | 'book_deleted' | 'user_deleted';
  title: string;
  message: string;
  entityId: string;
  entityType: 'user' | 'book' | 'order';
  read: boolean;
  createdAt: number;
}

export async function createAdminNotification(data: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>): Promise<void> {
  try {
    await addDoc(collection(db, 'admin_notifications'), {
      ...data,
      read: false,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    // Non-critical — don't block the main flow
    console.warn('Could not create admin notification:', error);
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'admin_notifications', notificationId), { read: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  const q = query(collection(db, 'admin_notifications'), where('read', '==', false));
  const snap = await getDocs(q);
  const updates = snap.docs.map(d => updateDoc(d.ref, { read: true }));
  await Promise.all(updates);
}

export function subscribeToNotifications(
  callback: (notifications: AdminNotification[]) => void
): () => void {
  const q = query(
    collection(db, 'admin_notifications'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const notifs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
      } as AdminNotification;
    });
    callback(notifs);
  });
}
