'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const checkoutSchema = z.object({
  name: z.string().min(2, 'שם מלא נדרש'),
  email: z.string().email('כתובת אימייל לא חוקית'),
  phone: z.string().min(9, 'מספר טלפון לא חוקי'),
  address: z.string().min(5, 'כתובת מלאה נדרשת'),
  city: z.string().min(2, 'עיר נדרשת'),
  zip: z.string().min(5, 'מיקוד נדרש'),
  buyerNote: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  // Split cart by author to calculate shipping
  const { itemsByAuthor, shippingFee, totalToPay } = useMemo(() => {
    const byAuthor: Record<string, typeof items> = {};
    items.forEach(item => {
      if (!byAuthor[item.book.authorId]) {
        byAuthor[item.book.authorId] = [];
      }
      byAuthor[item.book.authorId].push(item);
    });

    const SHIPPING_FEE_PER_AUTHOR = 0;
    const uniqueAuthorsCount = Object.keys(byAuthor).length;
    const totalShipping = uniqueAuthorsCount * SHIPPING_FEE_PER_AUTHOR;

    return {
      itemsByAuthor: byAuthor,
      shippingFee: totalShipping,
      totalToPay: totalPrice + totalShipping,
    };
  }, [items, totalPrice]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;
    setIsSubmitting(true);

    try {
      const baseUrl = window.location.origin;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerDetails: data,
          itemsByAuthor,
          totalToPay,
          baseUrl
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to generate checkout link');
      }
      
      clearCart();
      
      // Redirect to the PayPlus payment link (or mock success URL)
      if (responseData.url) {
        window.location.href = responseData.url;
      } else {
        throw new Error('No payment URL returned');
      }
      
    } catch (error: any) {
      console.error("Checkout failed:", error);
      alert(`אירעה שגיאה ביצירת עמוד התשלום: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    if (typeof window !== 'undefined') {
      setTimeout(() => router.push('/'), 0);
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium">העגלה ריקה. מועבר חזרה לחנות...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="text-3xl font-black text-gray-900">קופה מובטחת</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Form */}
          <div className="flex-1">
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="text-green-600" />
                פרטי משלוח
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">שם מלא *</label>
                    <input
                      {...register('name')}
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">טלפון נייד *</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                      dir="ltr"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">אימייל לקבלת קבלה *</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    dir="ltr"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">כתובת למשלוח (רחוב ומספר) *</label>
                      <input
                        {...register('address')}
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">עיר *</label>
                      <input
                        {...register('city')}
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">מיקוד *</label>
                      <input
                        {...register('zip')}
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">הערה לסופר (אופציונלי)</label>
                    <textarea
                      {...register('buyerNote')}
                      rows={3}
                      placeholder="בקשה להקדשה אישית, הוראות הגעה מיוחדות, וכו'..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
              <h2 className="text-lg font-bold text-gray-900 mb-6">סיכום הזמנה</h2>
              
              <ul className="space-y-4 mb-6 text-sm">
                {items.map(item => (
                  <li key={item.book.id} className="flex justify-between items-start font-medium text-gray-600">
                    <div>
                      <span className="font-bold text-gray-900">{item.quantity}x</span> {item.book.title}
                    </div>
                    <span className="shrink-0 mr-4">₪{(item.book.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-3 text-sm font-medium text-gray-600 mb-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>סך הכל פריטים</span>
                  <span>₪{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>דמי משלוח ({Object.keys(itemsByAuthor).length} סופרים)</span>
                  <span>₪{shippingFee.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  המשלוח חינם (מגולם במחיר הספר). כל ההכנסות מועברות ישירות אל הסופר.
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">לתשלום סופי</span>
                  <span className="text-3xl font-black text-green-700">₪{totalToPay.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  <strong>תשלום ישיר לסופר:</strong> עם לחיצה על תשלום, תקבל קישורים מאובטחים להעברת התשלום ישירות לחשבון (Paybox/Bit) של הסופרים שממנו רכשת.
                </p>
              </div>
              
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all text-lg disabled:opacity-70"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin ml-2" size={20} /> מייצר הזמנה...</>
                ) : (
                  <><ShieldCheck className="ml-2" size={20} /> המשך לתשלום ₪{totalToPay.toFixed(2)}</>
                )}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
