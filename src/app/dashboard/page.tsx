'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Book as BookIcon, DollarSign, TrendingUp, Package, Settings, HelpCircle, X } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Book, Order, User } from '@/types';
import { updateOrderTracking, getUserById } from '@/lib/firestore';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Eye } from 'lucide-react';

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

  // Settings State
  const [bio, setBio] = useState(user?.bio || '');
  const [age, setAge] = useState(user?.age || '');
  const [paymentLink, setPaymentLink] = useState(user?.paymentLink || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    async function fetchTargetUser() {
      if (isAdmin && impersonateUid) {
        const u = await getUserById(impersonateUid);
        setTargetUser(u);
        if (u) {
          setBio(u.bio || '');
          setAge(u.age || '');
          setPaymentLink(u.paymentLink || '');
        }
      } else {
        setTargetUser(user);
        if (user) {
          setBio(user.bio || '');
          setAge(user.age || '');
          setPaymentLink(user.paymentLink || '');
        }
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

  const totalRevenue = orders.reduce((sum, order) => sum + order.splitAuthor, 0);
  const openOrdersCount = orders.filter(o => o.status === 'pending').length;

  const stats = [
    { name: 'הכנסות החודש', value: `₪${totalRevenue.toFixed(2)}`, icon: DollarSign, trend: null },
    { name: 'ספרים נמכרו', value: orders.length.toString(), icon: TrendingUp, trend: null },
    { name: 'ספרים באוויר', value: books.filter(b => b.isPublished).length.toString(), icon: BookIcon, trend: null },
    { name: 'הזמנות לטיפול', value: openOrdersCount.toString(), icon: Package, trend: openOrdersCount > 0 ? 'לטיפול!' : null },
  ];

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUid) return;
    setSavingSettings(true);

    try {
      let avatarUrl = targetUser?.avatarUrl;

      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${targetUid}_${Date.now()}`);
        await uploadBytes(storageRef, avatarFile);
        avatarUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'users', targetUid), {
        bio,
        age,
        paymentLink,
        ...(avatarUrl && { avatarUrl })
      });

      alert('הפרופיל עודכן בהצלחה!');
      // A full page reload is a simple way to refresh the user context
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('אירעה שגיאה בשמירת הפרופיל');
    } finally {
      setSavingSettings(false);
    }
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
          <h2 className="text-xl font-bold text-gray-900">הזמנות לטיפול</h2>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">טוען נתונים...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">אין לך עדיין הזמנות</h3>
            <p className="text-gray-500 mb-6">כשהספרים שלך יימכרו, ההזמנות יופיעו כאן לצורך אריזה ומשלוח.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-xl p-6 bg-gray-50/50">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  
                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900 text-lg">הזמנה #{order.id}</span>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {order.status === 'pending' ? 'באריזה' : 'נשלח (יצא להפצה)'}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-600 mb-4">
                      ספר: <strong className="text-gray-900">{order.bookTitle}</strong>
                    </p>

                    <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-2">
                      <p className="text-sm"><strong>לקוח:</strong> {order.readerDetails.name}</p>
                      <p className="text-sm"><strong>כתובת למשלוח:</strong> {order.readerDetails.address}, {order.readerDetails.city}, {order.readerDetails.zip}</p>
                      <p className="text-sm"><strong>טלפון:</strong> {order.readerDetails.phone}</p>
                      
                      {order.readerDetails.buyerNote && (
                        <div className="mt-3 p-3 bg-green-50 text-green-800 rounded border border-green-100 text-sm">
                          <strong>הערה מהלקוח:</strong> {order.readerDetails.buyerNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fulfill Action */}
                  <div className="w-full lg:w-72 shrink-0 flex flex-col justify-center">
                    {order.status === 'pending' ? (
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-2">הזן מספר מעקב (דואר/צ'יטה):</label>
                        <input 
                          type="text"
                          value={trackingInputs[order.id] || ''}
                          onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                          placeholder="IL123456789"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3 text-left dir-ltr"
                        />
                        <button
                          onClick={() => handleFulfillOrder(order)}
                          disabled={fulfillingId === order.id}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-all"
                        >
                          {fulfillingId === order.id ? 'מעדכן...' : 'סמן כנשלח'}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                        <p className="text-sm text-green-800 font-bold mb-1">הספר נשלח!</p>
                        <p className="text-sm text-green-600">מספר מעקב: {order.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div id="settings" className="scroll-mt-24 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings size={24} className="text-green-600" />
            עריכת פרופיל סופר
          </h2>
          <p className="text-gray-500 mt-1">הפרופיל הציבורי שלך כפי שיוצג לרוכשים.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : targetUser?.avatarUrl ? (
                  <img src={targetUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl">
                    {targetUser?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <label className="text-sm text-green-600 font-bold cursor-pointer hover:underline">
                שנה תמונה
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">גיל</label>
                <input 
                  type="text" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full md:w-1/3 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="למשל: 34"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-bold text-gray-700">קישור לתשלום (Paybox / אשראי / Bit) *</label>
                  <button 
                    type="button" 
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <HelpCircle size={16} />
                  </button>
                </div>
                <input 
                  type="url" 
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://payboxapp.page.link/..."
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">חובה! לשם יועברו התשלומים מהרוכשים.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">קצת עליי (ביוגרפיה)</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="ספר לקוראים קצת על עצמך, מאיפה ההשראה שלך לספרים..."
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={savingSettings}
                  className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {savingSettings ? 'שומר...' : 'שמור שינויים'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden relative">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">איך עובד התשלום הישיר?</h3>
                <button 
                  onClick={() => setIsHelpModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                <p>במודל הנוכחי, התשלום מהקורא עובר ישירות אליך ללא עמלות תיווך! כדי לקבל תשלום, עליך להדביק כאן קישור קבוע אליו יופנו הקוראים בסיום ההזמנה.</p>
                
                <ul className="list-disc pr-5 space-y-3">
                  <li><strong>לסופרים פרטיים (ללא עוסק):</strong> מומלץ לפתוח "קופה" חינמית באפליקציית Paybox (יש להגדיר בהגדרות הקופה שהיא 'פרטית'), ולהדביק כאן את הקישור שנוצר לקופה.</li>
                  <li><strong>לסופרים בעלי עסק רשום:</strong> ניתן להדביק כאן קישור קבוע לדף תשלום באשראי שהפקתם דרך חברת הסליקה שלכם (כמו משולם, PayPlus, אשורית וכו').</li>
                </ul>

                <div className="mt-6 bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl font-medium">
                  <strong>שימו לב:</strong> באחריותכם המלאה לוודא שהתשלום אכן נכנס לחשבונכם לפני שאתם אורזים ושולחים את הספר לקורא!
                </div>
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={() => setIsHelpModalOpen(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  הבנתי, תודה!
                </button>
              </div>
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
