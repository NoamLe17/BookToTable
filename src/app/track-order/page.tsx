'use client';

import React, { useState } from 'react';
import { Package, Truck, Search, Loader2, ArrowRight } from 'lucide-react';
import { getOrderById } from '@/lib/firestore';
import { Order } from '@/types';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const fetchedOrder = await getOrderById(orderId.trim());
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      } else {
        setError('לא מצאנו הזמנה עם המספר הזה. אנא ודא שהקשת את המספר המדויק מהקבלה.');
      }
    } catch (err) {
      console.error(err);
      setError('אירעה שגיאה בחיפוש ההזמנה. אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col items-center pt-20 px-4 sm:px-6">
      
      <div className="w-full max-w-xl text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Truck size={40} className="text-green-600" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">מעקב משלוחים</h1>
        <p className="text-lg text-gray-600 font-medium">הכנס את מספר ההזמנה שלך שקיבלת במייל או בעמוד התשלום כדי לבדוק מה הסטטוס שלה.</p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSearch} className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">מספר הזמנה</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="לדוגמה: x8H9k..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-left dir-ltr"
                dir="ltr"
              />
              <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
            </div>
            <button 
              type="submit"
              disabled={loading || !orderId.trim()}
              className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md disabled:opacity-50 shrink-0 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'חפש הזמנה'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm font-medium mt-3">{error}</p>}
        </form>

        {order && (
          <div className="border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex items-center gap-3 mb-8">
              <span className="font-bold text-gray-900 text-lg">הזמנה #{order.id}</span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
              <h3 className="text-sm font-bold text-gray-500 mb-4">סטטוס משלוח</h3>
              
              {order.status === 'pending' ? (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-4 relative">
                    <Package size={32} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></span>
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 mb-2">הספר באריזה אצל הסופר</h4>
                  <p className="text-gray-600 font-medium">הסופר קיבל את ההזמנה שלך ומכין אותה ברגעים אלו למשלוח. ברגע שהיא תצא לדרך, מספר המעקב יופיע כאן.</p>
                </div>
              ) : order.status === 'shipped' || order.status === 'in_transit' || order.status === 'delivered' ? (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                    <Truck size={32} />
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 mb-2">הספר יצא להפצה!</h4>
                  <p className="text-gray-600 font-medium mb-6">הסופר מסר את הספר לחברת המשלוחים והוא בדרך אליך.</p>
                  
                  <div className="w-full bg-white p-4 rounded-xl border border-green-100 mb-4">
                    <p className="text-sm text-green-800 font-bold mb-1">מספר מעקב</p>
                    <p className="text-xl text-gray-900 font-black tracking-widest" dir="ltr">{order.trackingNumber}</p>
                  </div>
                  
                  <a 
                    href="https://israelpost.co.il/itemtrace" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-green-600 hover:text-green-700 font-bold text-sm bg-green-50 px-4 py-2 rounded-full transition-colors"
                  >
                    מעקב באתר דואר ישראל <ArrowRight size={16} className="mr-2" />
                  </a>
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 mb-4">פרטי הזמנה</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-500 font-medium">שם הלקוח</span>
                  <span className="font-bold text-gray-900">{order.readerDetails.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-500 font-medium">כתובת</span>
                  <span className="font-bold text-gray-900 text-left">{order.readerDetails.address}, {order.readerDetails.city}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-500 font-medium">ספר</span>
                  <span className="font-bold text-gray-900">{order.bookTitle}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500 font-medium">סה"כ שולם</span>
                  <span className="font-bold text-green-600">₪{order.totalPaid.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-gray-500 hover:text-green-600 font-medium transition-colors">
          חזרה לחנות &rarr;
        </Link>
      </div>

    </div>
  );
}
