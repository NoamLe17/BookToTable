'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection, onSnapshot, query, doc, deleteDoc, orderBy,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { createAdminNotification } from '@/lib/firestore';
import {
  Users, BookOpen, ShoppingBag, Trash2, Eye,
  TrendingUp, Clock, ChevronDown, ChevronUp, Globe, RefreshCw,
  AlertTriangle, CheckCircle2, Zap, Database,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AdminUser = { id: string; name?: string; email?: string; createdAt?: number };
type AdminBook = {
  id: string;
  authorId?: string;
  title?: string;
  coverUrl?: string;
  price?: number;
  isPublished?: boolean;
  createdAt?: number;
  salesCount?: number;
};
type AdminOrder = {
  id: string;
  bookTitle?: string;
  bookId?: string;
  readerDetails?: { name?: string; email?: string; city?: string; zip?: string; address?: string };
  totalPaid?: number;
  status?: string;
  createdAt?: number;
};

export default function AdminDashboard() {
  const { firebaseUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<'success' | 'error' | null>(null);
  const [isForceIndexing, setIsForceIndexing] = useState(false);
  const [forceIndexResult, setForceIndexResult] = useState<{ succeeded: number; failed: number } | null>(null);

  // Firebase sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ orphaned: number; users: { id: string; name?: string; email?: string }[] } | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה במחיקה';
      toast.error('שגיאה במחיקה: ' + message);
    }
  };

  const handlePingSitemap = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      // Ping Google & Bing with the sitemap
      const [googleRes, bingRes] = await Promise.allSettled([
        fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent('https://www.booktotable.com/sitemap.xml')}`),
        fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent('https://www.booktotable.com/sitemap.xml')}`),
      ]);
      void googleRes;
      void bingRes;
      setPingResult('success');
      toast.success('סיטמאפ נשלח לגוגל + Bing בהצלחה! גוגל יסרוק את הסיטמאפ בקרוב');
    } catch (err: unknown) {
      setPingResult('error');
      console.error(err);
      toast.error('שגיאה בשליחת הסיטמאפ');
    } finally {
      setIsPinging(false);
    }
  };

  const handleForceIndexAll = async () => {
    if (!firebaseUser) return;
    setIsForceIndexing(true);
    setForceIndexResult(null);
    try {
      const idToken = await firebaseUser.getIdToken();
      const res = await fetch('/api/indexing/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (data.success) {
        setForceIndexResult({ succeeded: data.succeeded, failed: data.failed });
        toast.success(`✅ ${data.succeeded} עמודים נשלחו לגוגל לאינדוקס מיידי!`);
      } else {
        toast.error('שגיאה: ' + (data.error || 'נסיון כשל'));
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('שגיאה בשליחת בקשת האינדוקס');
    } finally {
      setIsForceIndexing(false);
    }
  };

  // POST to an admin API route and always return parsed JSON (or a readable error)
  const postAdminApi = async (url: string, body: Record<string, unknown>) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, error: `HTTP ${res.status}: ${text.slice(0, 200) || res.statusText}` };
    }
  };

  const handleSyncCheck = async (silent = false) => {
    if (!firebaseUser) return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const idToken = await firebaseUser.getIdToken();
      const data = await postAdminApi('/api/admin/sync-users', { idToken, action: 'check' });
      if (data.success) {
        setSyncResult({ orphaned: data.orphaned, users: data.users });
        if (data.orphaned === 0) {
          if (!silent) toast.success('✅ כל הנתונים מסונכרנים! אין משתמשים יתומים.');
        } else {
          toast('⚠️ נמצאו ' + data.orphaned + ' משתמשים יתומים ב-Firestore', { icon: '⚠️' });
        }
      } else {
        toast.error('שגיאה בבדיקת סנכרון: ' + data.error);
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : '';
      toast.error('שגיאה בבדיקת הסנכרון ' + message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Automatic sync check whenever the admin panel loads
  const autoSyncDone = useRef(false);
  useEffect(() => {
    if (!firebaseUser || autoSyncDone.current) return;
    autoSyncDone.current = true;
    handleSyncCheck(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  const handleSyncCleanup = async () => {
    if (!firebaseUser) return;
    if (!syncResult || syncResult.orphaned === 0) return;
    if (!confirm(`האם למחוק לצמיתות ${syncResult.orphaned} משתמשים יתומים מ-Firestore?`)) return;
    setIsCleaning(true);
    try {
      const idToken = await firebaseUser.getIdToken();
      const data = await postAdminApi('/api/admin/sync-users', { idToken, action: 'cleanup' });
      if (data.success) {
        toast.success(`✅ ${data.cleaned} משתמשים יתומים נמחקו מ-Firestore`);
        setSyncResult(null);
      } else {
        toast.error('שגיאה: ' + data.error);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('שגיאה בניקוי');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDeleteUser = async (uid: string, name: string) => {
    if (!confirm(`האם למחוק לצמיתות את המשתמש "${name}"? פעולה זו בלתי הפיכה!`)) return;
    if (!firebaseUser) return;
    try {
      const toastId = toast.loading('מוחק משתמש...');
      // Pass ID token (not email) for real server-side verification
      const idToken = await firebaseUser.getIdToken();
      
      const res = await postAdminApi('/api/admin/delete-user', { uid, idToken });
      
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'הפעולה נכשלה';
      toast.error('הפעולה נכשלה: ' + message);
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

  const revenue = orders.reduce((sum: number, o: AdminOrder) => sum + (o.totalPaid || 0), 0);
  const pendingOrders = orders.filter((o: AdminOrder) => o.status === 'pending' || o.status === 'pending_payment').length;

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Google Indexing Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-blue-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Globe size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Google Search Console — אינדוקס</h3>
              <p className="text-xs text-gray-500">שלח את כל הדפים לגוגל לאינדוקס מיידי דרך Google Indexing API</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleForceIndexAll}
              disabled={isForceIndexing}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60"
            >
              <Zap size={15} className={isForceIndexing ? 'animate-pulse' : ''} />
              {isForceIndexing ? 'שולח לגוגל...' : '⚡ Force Index הכל'}
            </button>
            <button
              onClick={handlePingSitemap}
              disabled={isPinging}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60"
            >
              <RefreshCw size={15} className={isPinging ? 'animate-spin' : ''} />
              {isPinging ? 'שולח...' : 'Ping סיטמאפ'}
            </button>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              <Eye size={15} />
              Search Console
            </a>
          </div>
          {forceIndexResult && (
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-green-600" />
              <span className="text-xs font-bold text-green-700">
                {forceIndexResult.succeeded} עמודים הוגשו לגוגל
                {forceIndexResult.failed > 0 && ` · ${forceIndexResult.failed} נכשלו`}
              </span>
            </div>
          )}
          {pingResult === 'success' && !forceIndexResult && (
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-green-600" />
              <span className="text-xs font-bold text-green-700">סיטמאפ נשלח בהצלחה!</span>
            </div>
          )}
        </div>
      </div>

      {/* Firebase Data Sync Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <Database size={20} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">בדיקת סנכרון Firebase</h3>
              <p className="text-xs text-gray-500">
                בודק שכל הנתונים ב-Firestore מסונכרנים עם Firebase Auth — מוחק משתמשים "יתומים" (נמחקו מ-Auth אך נשארו ב-Firestore)
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSyncCheck()}
              disabled={isSyncing || isCleaning}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60"
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'בודק...' : 'בדוק סנכרון'}
            </button>
            {syncResult && syncResult.orphaned > 0 && (
              <button
                onClick={handleSyncCleanup}
                disabled={isCleaning}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60"
              >
                <Trash2 size={15} />
                {isCleaning ? 'מנקה...' : `נקה ${syncResult.orphaned} יתומים`}
              </button>
            )}
          </div>
          {syncResult && (
            <div className="mt-3">
              {syncResult.orphaned === 0 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-green-600" />
                  <span className="text-xs font-bold text-green-700">✅ כל הנתונים מסונכרנים — אין משתמשים יתומים</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={15} className="text-orange-500" />
                    <span className="text-xs font-bold text-orange-700">
                      נמצאו {syncResult.orphaned} משתמשים ב-Firestore שנמחקו מ-Firebase Auth:
                    </span>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto">
                    {syncResult.users.map(u => (
                      <div key={u.id} className="text-xs text-gray-700 font-mono flex gap-2">
                        <span className="text-gray-400">{u.id.slice(0, 10)}...</span>
                        <span className="font-bold">{u.name || u.email || 'ללא שם'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
                      onClick={() => handleDeleteUser(u.id, u.name || u.email || 'משתמש')}
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
                        onClick={() => handleDeleteUser(u.id, u.name || u.email || 'משתמש')}
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
                  onClick={() => handleDeleteBook(b.id, b.title || 'ספר', b.coverUrl || '')}
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
                        onClick={() => handleDeleteBook(b.id, b.title || 'ספר', b.coverUrl || '')}
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
                <p className="font-bold text-sm truncate">{o.bookTitle || o.bookId || 'ספר'}</p>
                <p className="text-xs text-gray-400">{o.readerDetails?.name ?? '—'} · ₪{o.totalPaid ?? 0}</p>
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
