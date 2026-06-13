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
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), data as Record<string, unknown>);
}

// ==================== BOOKS ====================
const mockBooks: Book[] = [];

export async function getBooks(limitCount = 20): Promise<Book[]> {
  try {
    const q = query(
      collection(db, 'books'),
      orderBy('createdAt', 'desc'),
      limit(limitCount * 2) // Fetch a bit more in case we need to filter
    );
    const snap = await getDocs(q);
    const allBooks = snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Book;
    });
    // Filter in memory to avoid needing a composite index in Firestore
    return allBooks.filter(b => b.isPublished).slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching getBooks:', error);
    return [];
  }
}

export async function getBestsellers(limitCount = 8): Promise<Book[]> {
  try {
    const q = query(
      collection(db, 'books'),
      orderBy('salesCount', 'desc'),
      limit(limitCount * 2)
    );
    const snap = await getDocs(q);
    const allBooks = snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() || Date.now() } as Book;
    });
    return allBooks.filter(b => b.isPublished).slice(0, limitCount);
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
const mockAuthors: User[] = [];

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
