'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Hash } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSearchParams } from 'next/navigation';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderIds = searchParams.get('orders')?.split(',') || [];
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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-sm border border-gray-100 relative overflow-hidden">
        
        {/* Success Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-70"></div>
          <div className="relative bg-green-50 rounded-full w-full h-full flex items-center justify-center">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4">תודה רבה על הקנייה!</h1>
        <p className="text-gray-600 mb-6 font-medium leading-relaxed">
          ההזמנה שלך נקלטה בהצלחה. ברגעים אלו ממש העברנו את הכסף ישירות לסופרים העצמאיים, והם קיבלו התראה לארוז את הספר עבורך.
        </p>

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
            <p className="text-xs text-green-700 mt-2">
              מספרים אלו יישלחו אליך גם במייל יחד עם הקבלה.
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-right border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package size={18} className="text-gray-500" />
            מה קורה עכשיו?
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            הסופרים יארזו את הספרים ויוציאו אותם למשלוח בימים הקרובים. תקבל/י עדכונים למייל על סטטוס המשלוח.
          </p>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md w-full"
        >
          חזרה לדף הראשי <ArrowRight size={20} />
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
