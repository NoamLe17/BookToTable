'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Hash, CreditCard, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, User } from '@/types';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderIds = searchParams.get('orders')?.split(',') || [];
  
  const [authorPayments, setAuthorPayments] = useState<{ 
    authorName: string; 
    amount: number; 
    paymentLink: string;
    paymentMethods?: any;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire confetti on successful purchase!
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#16a34a', '#86efac', '#15803d']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#16a34a', '#86efac', '#15803d']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  useEffect(() => {
    async function fetchPaymentDetails() {
      if (orderIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const authorsMap = new Map<string, { authorId: string, amount: number }>();

        // Fetch each order
        for (const oId of orderIds) {
          const orderSnap = await getDoc(doc(db, 'orders', oId));
          if (orderSnap.exists()) {
            const order = orderSnap.data() as Order;
            const current = authorsMap.get(order.authorId) || { authorId: order.authorId, amount: 0 };
            current.amount += order.totalPaid;
            authorsMap.set(order.authorId, current);
          }
        }

        const payments = [];
        // Fetch author profiles
        for (const [authorId, data] of Array.from(authorsMap.entries())) {
          const userSnap = await getDoc(doc(db, 'users', authorId));
          if (userSnap.exists()) {
            const authorData = userSnap.data() as User;
            payments.push({
              authorName: authorData.name,
              amount: data.amount,
              paymentLink: authorData.paymentLink || '',
              paymentMethods: authorData.paymentMethods,
            });
          }
        }

        setAuthorPayments(payments);
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentDetails();
  }, [orderIds.join(',')]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-sm border border-gray-100 relative overflow-hidden">
        
        {/* Success Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-yellow-100 rounded-full animate-ping opacity-70"></div>
          <div className="relative bg-yellow-50 rounded-full w-full h-full flex items-center justify-center">
            <CheckCircle2 size={48} className="text-yellow-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4">ההזמנה נוצרה! שים לב:</h1>
        <p className="text-gray-600 mb-8 font-medium leading-relaxed">
          ההזמנה שלך נקלטה במערכת בהצלחה, אך <strong className="text-gray-900">טרם שולמה</strong>.
          כדי שהסופרים יתחילו באריזת הספרים, עליך להעביר להם את התשלום בנפרד דרך הקישורים המאובטחים מטה:
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
            <p className="text-sm text-gray-500 font-medium">מייצר קישורי תשלום...</p>
          </div>
        ) : (
          <div className="space-y-6 mb-8 text-right">
            {authorPayments.map((payment, idx) => (
              <div key={idx} className="bg-white border-2 border-gray-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-green-500"></div>
                <h3 className="text-lg font-black text-gray-900 mb-1">
                  תשלום לסופר/ת: {payment.authorName}
                </h3>
                <p className="text-gray-600 font-medium mb-4">
                  סכום להעברה: <span className="text-green-700 font-bold">₪{payment.amount.toFixed(2)}</span>
                </p>

                {payment.paymentMethods && Object.keys(payment.paymentMethods).length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 font-bold mb-2">איך תרצה לשלם?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Bit */}
                      {payment.paymentMethods.bit && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-center items-center text-center hover:border-green-300 transition-colors">
                          <img src="https://www.bitpay.co.il/assets/images/bit-logo.svg" alt="Bit" className="h-8 mb-2 opacity-80" />
                          <span className="text-sm font-bold text-gray-800 block mb-1">העברה בביט למספר:</span>
                          <span className="text-lg font-black text-blue-600 tracking-wider" dir="ltr">{payment.paymentMethods.bit}</span>
                        </div>
                      )}

                      {/* Paybox */}
                      {payment.paymentMethods.paybox && (
                        <a href={payment.paymentMethods.paybox} target="_blank" rel="noopener noreferrer" className="bg-blue-50 border border-blue-100 hover:border-blue-300 rounded-xl p-4 flex flex-col justify-center items-center text-center transition-colors group">
                          <span className="text-blue-600 font-black text-xl mb-1 group-hover:scale-105 transition-transform">Paybox</span>
                          <span className="text-sm font-bold text-blue-800">לחץ למעבר לקופה</span>
                        </a>
                      )}

                      {/* Credit Card */}
                      {payment.paymentMethods.creditCard && (
                        <a href={payment.paymentMethods.creditCard} target="_blank" rel="noopener noreferrer" className="bg-green-50 border border-green-100 hover:border-green-300 rounded-xl p-4 flex flex-col justify-center items-center text-center transition-colors group">
                          <CreditCard size={28} className="text-green-600 mb-1 group-hover:scale-105 transition-transform" />
                          <span className="text-sm font-bold text-green-800">תשלום מאובטח באשראי</span>
                        </a>
                      )}

                      {/* Bank Transfer */}
                      {payment.paymentMethods.bankTransfer && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:col-span-2 hover:border-green-300 transition-colors">
                          <span className="text-sm font-bold text-gray-800 block mb-2 border-b pb-1">פרטי העברה בנקאית:</span>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                            <div><span className="font-bold">בנק:</span> {payment.paymentMethods.bankTransfer.bankName}</div>
                            <div><span className="font-bold">סניף:</span> {payment.paymentMethods.bankTransfer.branch}</div>
                            <div><span className="font-bold">חשבון:</span> {payment.paymentMethods.bankTransfer.account}</div>
                            <div><span className="font-bold">שם המוטב:</span> {payment.paymentMethods.bankTransfer.accountName}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : payment.paymentLink ? (
                  // Legacy fallback
                  <a 
                    href={payment.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-all"
                  >
                    <CreditCard size={20} />
                    מעבר לעמוד התשלום של הסופר (אשראי / אפליקציות)
                  </a>
                ) : (
                  <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                    לסופר זה טרם הוגדרו אמצעי תשלום. אנא צור איתו קשר להעברת הכסף.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {orderIds.length > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-8 text-center">
            <h3 className="font-bold text-green-800 mb-2 flex items-center justify-center gap-2">
              <Hash size={18} /> מספרי ההזמנה שלך למעקב
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {orderIds.map(id => (
                <span key={id} className="bg-white px-3 py-1 rounded-md text-sm font-bold text-gray-700 shadow-sm border border-green-200">
                  {id.substring(0, 8).toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-right border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package size={18} className="text-gray-500" />
            מה קורה עכשיו?
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            הסופרים יקבלו את ההזמנה ברגע זה. לאחר שתעביר להם את הכסף, הם יוודאו את התשלום ויארזו את הספרים שלך למשלוח!
          </p>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-green-600 font-bold py-2 px-4 rounded-xl transition-all"
        >
          חזרה לחנות <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">טוען...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
