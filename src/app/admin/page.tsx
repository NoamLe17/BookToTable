'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection, onSnapshot, query, doc, deleteDoc, orderBy,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { deleteUserAction } from '@/app/actions/admin';
import { createAdminNotification } from '@/lib/firestore';
import {
  Users, BookOpen, ShoppingBag, Trash2, Eye,
  TrendingUp, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type SortKey = 'name' | 'email' | 'bookCount';

export default function AdminDashboard() {
  const { firebaseUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    let loaded = 0;
    const checkLoaded = () => { if (++loaded >= 3) setLoading(false); };

    const unsubUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      checkLoaded();
    });
    const unsubBooks = onSnapshot(query(collection(db, 'books'), orderBy('createdAt', 'desc')), (snap) => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      checkLoaded();
    });
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      checkLoaded();
    });

    return () => { unsubUsers(); unsubBooks(); unsubOrders(); };
  }, []);

  const handleDeleteBook = async (bookId: string, bookTitle: string, coverUrl: string) => {
    if (!confirm(`למחוק לצמיתות את הספר "${bookTitle}"?`)) return;
    try {
      await deleteDoc(doc(db, 'books', bookId));
      // Notify admin about deletion
      await createAdminNotification({
        type: 'book_deleted',
        title: 'ספר נמחק',
        message: `"${bookTitle}" נמחק על ידי המנהל`,
        entityId: bookId,
        entityType: 'book',
      });
      // Delete cover from storage
      if (coverUrl?.includes('firebasestorage')) {
        try { await deleteObject(ref(storage, coverUrl)); } catch { /* ok */ }
      }
      toast.success('הספר נמחק בהצלחה');
    } catch (err: any) {
      toast.error('שגיאה במחיקה: ' + err.message);
    }
  };

  const handleDeleteUser = async (uid: string, name: string) => {
    if (!confirm(`האם למחוק לצמיתות את המשתמש "${name}"? פעולה זו בלתי הפיכה!`)) return;
    if (!firebaseUser?.email) return;
    try {
      const toastId = toast.loading('מוחק משתמש...');
      const res = await deleteUserAction(uid, firebaseUser.email);
      if (res.success) {
        await createAdminNotification({
          type: 'user_deleted',
          title: 'משתמש נמחק',
          message: `${name} נמחק על ידי המנהל`,
          entityId: uid,
          entityType: 'user',
        });
        toast.success('המשתמש נמחק בהצלחה', { id: toastId });
      } else {
        toast.error('שגיאה: ' + res.error, { id: toastId });
      }
    } catch (err: any) {
      toast.error('הפעולה נכשלה: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 font-medium">טוען נתוני מנהל...</p>
        </div>
      </div>
    );
  }

  const revenue = orders.reduce((sum: number, o: any) => sum + (o.totalPaid || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'pending_payment').length;

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'משתמשים', value: users.length, icon: Users, color: 'bg-blue-100 text-blue-600', trend: null },
          { label: 'ספרים', value: books.length, icon: BookOpen, color: 'bg-green-100 text-green-600', trend: null },
          { label: 'הזמנות', value: orders.length, icon: ShoppingBag, color: 'bg-purple-100 text-purple-600', trend: null },
          { label: 'הכנסה כוללת', value: `₪${revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-orange-100 text-orange-600', trend: null },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4">
            <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-full flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-bold truncate">{stat.label}</p>
              <p className="text-xl sm:text-3xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending orders alert */}
      {pendingOrders > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Clock size={20} className="text-yellow-600 shrink-0" />
          <p className="text-yellow-800 font-bold text-sm">
            יש {pendingOrders} הזמנות בהמתנה לטיפול
          </p>
          <Link href="/admin/notifications" className="mr-auto text-yellow-700 underline text-sm font-medium">
            צפה
          </Link>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            ניהול משתמשים
          </h2>
          <span className="text-sm text-gray-400 font-medium">{users.length} משתמשים</span>
        </div>

        {/* Mobile: Card list */}
        <div className="sm:hidden divide-y divide-gray-100">
          {users.map(u => {
            const userBooks = books.filter(b => b.authorId === u.id).length;
            const isOpen = expandedUser === u.id;
            return (
              <div key={u.id} className="p-4">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedUser(isOpen ? null : u.id)}
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-black text-sm shrink-0">
                    {(u.name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{u.name || 'ללא שם'}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {userBooks} ספרים
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2 flex-wrap">
                    <button
                      onClick={() => router.push(`/dashboard?impersonate=${u.id}`)}
                      className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold"
                    >
                      <Eye size={14} /> צפה בדשבורד
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-bold"
                    >
                      <Trash2 size={14} /> מחק משתמש
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="p-8 text-center text-gray-400">אין משתמשים</p>
          )}
        </div>

        {/* Desktop: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="p-4 font-bold text-right">שם / ID</th>
                <th className="p-4 font-bold text-right">אימייל</th>
                <th className="p-4 font-bold text-right">ספרים</th>
                <th className="p-4 font-bold text-right">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm">{u.name || 'ללא שם'}</div>
                    <div className="text-xs text-gray-400 font-mono">{u.id.slice(0, 12)}...</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{u.email}</td>
                  <td className="p-4 text-sm font-bold text-gray-600">
                    {books.filter(b => b.authorId === u.id).length}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard?impersonate=${u.id}`)}
                        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Eye size={14} /> צפה בדשבורד
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Trash2 size={14} /> מחק
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">אין משתמשים</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-green-600" />
            ניהול ספרים
          </h2>
          <span className="text-sm text-gray-400 font-medium">{books.length} ספרים</span>
        </div>

        {/* Mobile: Card list */}
        <div className="sm:hidden divide-y divide-gray-100">
          {books.map(b => (
            <div key={b.id} className="p-4 flex items-center gap-3">
              {b.coverUrl ? (
                <img src={b.coverUrl} alt={b.title} className="w-12 h-16 object-cover rounded-lg shrink-0" />
              ) : (
                <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{b.title}</p>
                <p className="text-xs text-gray-400 truncate">מחיר: ₪{b.price} · {b.salesCount || 0} נמכרו</p>
                <p className={`text-xs font-bold mt-0.5 ${b.isPublished ? 'text-green-600' : 'text-gray-400'}`}>
                  {b.isPublished ? '● פורסם' : '○ טיוטה'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <Link
                  href={`/books/${b.id}`}
                  className="flex items-center gap-1 text-blue-600 text-xs font-bold"
                  target="_blank"
                >
                  <Eye size={13} /> צפה
                </Link>
                <button
                  onClick={() => handleDeleteBook(b.id, b.title, b.coverUrl)}
                  className="flex items-center gap-1 text-red-600 text-xs font-bold"
                >
                  <Trash2 size={13} /> מחק
                </button>
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <p className="p-8 text-center text-gray-400">אין ספרים</p>
          )}
        </div>

        {/* Desktop: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="p-4 font-bold text-right">כריכה</th>
                <th className="p-4 font-bold text-right">כותרת</th>
                <th className="p-4 font-bold text-right">מחיר</th>
                <th className="p-4 font-bold text-right">נמכרו</th>
                <th className="p-4 font-bold text-right">סטטוס</th>
                <th className="p-4 font-bold text-right">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {b.coverUrl ? (
                      <img src={b.coverUrl} alt={b.title} className="w-10 h-14 object-cover rounded-md" />
                    ) : (
                      <div className="w-10 h-14 bg-gray-100 rounded-md flex items-center justify-center">
                        <BookOpen size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-sm max-w-[200px] truncate">{b.title}</td>
                  <td className="p-4 text-sm font-medium">₪{b.price}</td>
                  <td className="p-4 text-sm text-gray-500">{b.salesCount || 0}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.isPublished ? 'פורסם' : 'טיוטה'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/books/${b.id}`}
                        target="_blank"
                        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1.5 rounded-lg text-xs font-bold"
                      >
                        <Eye size={13} /> צפה
                      </Link>
                      <button
                        onClick={() => handleDeleteBook(b.id, b.title, b.coverUrl)}
                        className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-2 py-1.5 rounded transition-colors text-xs font-bold"
                      >
                        <Trash2 size={13} /> מחק
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">אין ספרים</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <ShoppingBag size={20} className="text-purple-600" />
            הזמנות אחרונות
          </h2>
          <span className="text-sm text-gray-400 font-medium">{orders.length} הזמנות</span>
        </div>
        <div className="divide-y divide-gray-100">
          {orders.slice(0, 10).map(o => (
            <div key={o.id} className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <ShoppingBag size={16} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{o.bookTitle || o.bookId}</p>
                <p className="text-xs text-gray-400">{o.readerDetails?.name} · ₪{o.totalPaid}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                o.status === 'delivered' ? 'bg-green-100 text-green-700'
                : o.status === 'shipped' ? 'bg-blue-100 text-blue-700'
                : o.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
              }`}>
                {o.status === 'delivered' ? 'הגיע'
                  : o.status === 'shipped' ? 'נשלח'
                  : o.status === 'pending' ? 'ממתין'
                  : o.status === 'pending_payment' ? 'ממתין לתשלום'
                  : o.status}
              </span>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="p-8 text-center text-gray-400">אין הזמנות עדיין</p>
          )}
        </div>
      </div>

    </div>
  );
}
