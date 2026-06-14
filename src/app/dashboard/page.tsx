'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Book as BookIcon, DollarSign, TrendingUp, Package, Eye, ChevronUp, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Book, Order, User } from '@/types';
import { updateOrderTracking, getUserById, updateOrderStatus } from '@/lib/firestore';
import { useSearchParams, useRouter } from 'next/navigation';

type SortColumn = 'date' | 'quantity' | 'totalPaid' | 'status';
type SortDirection = 'asc' | 'desc';

function DashboardContent() {
  const { firebaseUser, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const impersonateUid = searchParams.get('impersonate');
  const isAdmin = firebaseUser?.email === 'noamhemo2001@gmail.com';
  const targetUid = (isAdmin && impersonateUid) ? impersonateUid : firebaseUser?.uid;

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting State
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    async function fetchTargetUser() {
      if (isAdmin && impersonateUid) {
        const u = await getUserById(impersonateUid);
        setTargetUser(u);
      } else {
        setTargetUser(user);
      }
    }
    if (firebaseUser) fetchTargetUser();
  }, [firebaseUser, user, isAdmin, impersonateUid]);

  useEffect(() => {
    async function fetchMyBooks() {
      if (!targetUid) return;
      try {
        const qBooks = query(collection(db, 'books'), where('authorId', '==', targetUid));
        const snapBooks = await getDocs(qBooks);
        const myBooks = snapBooks.docs.map(d => ({ id: d.id, ...d.data() } as Book));
        setBooks(myBooks);

        const qOrders = query(collection(db, 'orders'), where('authorId', '==', targetUid));
        const snapOrders = await getDocs(qOrders);
        const myOrders = snapOrders.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        setOrders(myOrders);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyBooks();
  }, [targetUid]);

  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleFulfillOrder = async (order: Order) => {
    const trackingNumber = trackingInputs[order.id];
    if (!trackingNumber?.trim()) {
      alert('יש להזין מספר מעקב');
      return;
    }

    setFulfillingId(order.id);
    try {
      await updateOrderTracking(order.id, trackingNumber);
      
      // Update local state
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'shipped', trackingNumber } : o));

      // Fire tracking email
      await fetch('/api/email/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: order.readerDetails.email,
          name: order.readerDetails.name,
          orderId: order.id,
          trackingNumber,
          bookTitle: order.bookTitle
        }),
      });

      alert('ההזמנה סומנה כנשלחה ומייל נשלח ללקוח!');
    } catch (error) {
      console.error('Failed to fulfill order:', error);
      alert('אירעה שגיאה. נסה שנית.');
    } finally {
      setFulfillingId(null);
    }
  };

  const handleCompleteOrder = async (order: Order) => {
    setCompletingId(order.id);
    try {
      await updateOrderStatus(order.id, 'delivered');
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'delivered' } : o));
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert('אירעה שגיאה. נסה שנית.');
    } finally {
      setCompletingId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.splitAuthor, 0);
  const openOrdersCount = orders.filter(o => o.status === 'pending').length;

  const stats = [
    { name: 'הכנסות החודש', value: `₪${totalRevenue.toFixed(2)}`, icon: DollarSign, trend: null },
    { name: 'ספרים נמכרו', value: orders.length.toString(), icon: TrendingUp, trend: null },
    { name: 'ספרים באוויר', value: books.filter(b => b.isPublished).length.toString(), icon: BookIcon, trend: null },
    { name: 'הזמנות לטיפול', value: openOrdersCount.toString(), icon: Package, trend: openOrdersCount > 0 ? 'לטיפול!' : null },
  ];

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let comparison = 0;
    if (sortColumn === 'date') {
      comparison = b.createdAt - a.createdAt; // default desc (b - a)
      if (sortDirection === 'asc') comparison = -comparison;
    } else if (sortColumn === 'quantity') {
      comparison = (b.quantity || 1) - (a.quantity || 1);
      if (sortDirection === 'asc') comparison = -comparison;
    } else if (sortColumn === 'totalPaid') {
      comparison = b.splitAuthor - a.splitAuthor;
      if (sortDirection === 'asc') comparison = -comparison;
    } else if (sortColumn === 'status') {
      comparison = a.status.localeCompare(b.status);
      if (sortDirection === 'desc') comparison = -comparison;
    }
  });

  const activeOrders = sortedOrders.filter(o => o.status !== 'delivered');
  const historyOrders = sortedOrders.filter(o => o.status === 'delivered');

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="inline ml-1 text-green-600" /> : <ChevronDown size={14} className="inline ml-1 text-green-600" />;
  };

  return (
    <div className="pb-20">
      {isAdmin && impersonateUid && (
        <div className="bg-red-600 text-white p-4 flex justify-between items-center rounded-xl mb-6 shadow-md mt-4 mx-4">
          <div className="font-bold flex items-center gap-2">
            <Eye size={20} />
            Admin Mode: Viewing as {targetUser?.name || targetUid}
          </div>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition-colors"
          >
            Exit Admin Panel
          </button>
        </div>
      )}

      <div id="overview" className="scroll-mt-24 px-4 sm:px-0">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">שלום, {targetUser?.name} 👋</h1>
        <p className="text-gray-500 font-medium mb-8">ברוך הבא ללוח הבקרה שלך. כאן תוכל לנהל את המכירות והספרים שלך.</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <stat.icon size={24} />
              </div>
              {stat.trend && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
      </div>

      {/* Quick Actions & Recent Books */}
      <div id="books" className="scroll-mt-24 bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">הספרים שלי</h2>
          <Link 
            href="/dashboard/books/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <BookIcon size={16} />
            הוסף ספר חדש
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">טוען נתונים...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <BookIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">אין לך עדיין ספרים</h3>
            <p className="text-gray-500 mb-6">הגיע הזמן להעלות את הספר הראשון שלך ולהתחיל למכור!</p>
            <Link 
              href="/dashboard/books/new"
              className="bg-white border border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-700 px-6 py-2.5 rounded-lg font-bold transition-all inline-block shadow-sm"
            >
              העלה ספר ראשון
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-medium">ספר</th>
                  <th className="pb-3 font-medium">מחיר</th>
                  <th className="pb-3 font-medium">מכירות</th>
                  <th className="pb-3 font-medium">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {books.slice(0, 5).map((book) => (
                  <tr key={book.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center">
                            <BookIcon size={16} className="text-gray-400" />
                          </div>
                        )}
                        <span className="font-bold text-gray-900">{book.title}</span>
                      </div>
                    </td>
                    <td className="py-4 font-medium">₪{book.price}</td>
                    <td className="py-4 font-medium text-gray-600">{book.salesCount}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${book.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {book.isPublished ? 'באוויר' : 'טיוטה'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div id="orders" className="scroll-mt-24 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">טבלת הזמנות</h2>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">טוען נתונים...</div>
        ) : activeOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">אין לך עדיין הזמנות</h3>
            <p className="text-gray-500 mb-6">כשהספרים שלך יימכרו, ההזמנות יופיעו כאן לצורך אריזה ומשלוח.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <th className="p-3 font-bold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('date')}>
                    תאריך מתוך {renderSortIcon('date')}
                  </th>
                  <th className="p-3 font-bold">ספר</th>
                  <th className="p-3 font-bold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('quantity')}>
                    כמות {renderSortIcon('quantity')}
                  </th>
                  <th className="p-3 font-bold">פרטי לקוח</th>
                  <th className="p-3 font-bold">הערות</th>
                  <th className="p-3 font-bold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('totalPaid')}>
                    תשלום {renderSortIcon('totalPaid')}
                  </th>
                  <th className="p-3 font-bold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                    סטטוס וטיפול {renderSortIcon('status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('he-IL', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3 font-medium text-gray-900">
                      {order.bookTitle}
                    </td>
                    <td className="p-3 text-gray-900 text-center font-bold">
                      {order.quantity || 1}
                    </td>
                    <td className="p-3">
                      <div className="text-gray-900 font-medium">{order.readerDetails.name}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {order.readerDetails.address}, {order.readerDetails.city}, {order.readerDetails.zip}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 dir-ltr text-right">
                        {order.readerDetails.phone}
                      </div>
                    </td>
                    <td className="p-3">
                      {order.readerDetails.buyerNote ? (
                        <span className="inline-block bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs p-1.5 rounded max-w-[150px] truncate" title={order.readerDetails.buyerNote}>
                          {order.readerDetails.buyerNote}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-gray-900">
                      ₪{order.splitAuthor.toFixed(2)}
                    </td>
                    <td className="p-3">
                      {order.status === 'pending' ? (
                        <div className="flex flex-col gap-2 min-w-[180px]">
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 w-fit">
                            באריזה
                          </span>
                          <div className="flex gap-1 mt-1">
                            <input 
                              type="text"
                              value={trackingInputs[order.id] || ''}
                              onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                              placeholder="מס' מעקב"
                              className="w-full bg-white border border-gray-200 rounded py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 dir-ltr text-left"
                            />
                            <button
                              onClick={() => handleFulfillOrder(order)}
                              disabled={fulfillingId === order.id}
                              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-2 py-1 rounded text-xs transition-all whitespace-nowrap"
                            >
                              {fulfillingId === order.id ? '...' : 'סמן כנשלח'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 min-w-[180px]">
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 w-fit">
                            נשלח
                          </span>
                          <span className="text-xs text-gray-500 dir-ltr text-right">
                            מעקב: {order.trackingNumber}
                          </span>
                          <button
                            onClick={() => handleCompleteOrder(order)}
                            disabled={completingId === order.id}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-2 py-1 rounded text-xs transition-all w-fit mt-1 border border-gray-200"
                          >
                            {completingId === order.id ? '...' : 'סמן כהושלם (הגיע ליעד)'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* History Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="text-gray-500 hover:text-green-600 font-medium text-sm transition-colors underline decoration-dashed underline-offset-4"
          >
            צפה בהיסטוריית הזמנות ({historyOrders.length})
          </button>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">היסטוריית הזמנות (הושלמו)</h2>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {historyOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">אין הזמנות שהושלמו עדיין.</div>
              ) : (
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                      <th className="p-3 font-bold">תאריך</th>
                      <th className="p-3 font-bold">ספר</th>
                      <th className="p-3 font-bold">כמות</th>
                      <th className="p-3 font-bold">פרטי לקוח</th>
                      <th className="p-3 font-bold">תשלום</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors opacity-80">
                        <td className="p-3 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('he-IL', {
                            day: '2-digit', month: '2-digit', year: 'numeric'
                          })}
                        </td>
                        <td className="p-3 font-medium text-gray-900">{order.bookTitle}</td>
                        <td className="p-3 font-bold text-gray-900">{order.quantity || 1}</td>
                        <td className="p-3">
                          <div className="text-gray-900 font-medium">{order.readerDetails.name}</div>
                          <div className="text-gray-500 text-xs mt-1">
                            {order.readerDetails.address}, {order.readerDetails.city}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-gray-900">₪{order.splitAuthor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
