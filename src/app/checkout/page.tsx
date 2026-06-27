'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, ArrowRight, Loader2, MapPin, Store, Info, X } from 'lucide-react';
import Link from 'next/link';
import { calculateDistance } from '@/lib/distance';
import { getUserById } from '@/lib/firestore';
import { User } from '@/types';

const checkoutSchema = z.object({
  name: z.string().min(2, 'שם מלא נדרש'),
  email: z.string().email('כתובת אימייל לא חוקית'),
  phone: z.string().min(9, 'מספר טלפון לא חוקי'),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  buyerNote: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type ShippingMethod = 'direct' | 'pickup_point' | 'self_pickup';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('direct');
  
  // States for live distance
  const [extraShippingFee, setExtraShippingFee] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  
  // Store fetched authors to avoid re-fetching
  const [authorsData, setAuthorsData] = useState<Record<string, User>>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const watchAddress = watch('address');
  const watchCity = watch('city');
  const watchZip = watch('zip');

  // Split cart by author
  const { itemsByAuthor, baseShippingFee } = useMemo(() => {
    const byAuthor: Record<string, typeof items> = {};
    items.forEach(item => {
      if (!byAuthor[item.book.authorId]) {
        byAuthor[item.book.authorId] = [];
      }
      byAuthor[item.book.authorId].push(item);
    });

    return {
      itemsByAuthor: byAuthor,
      baseShippingFee: 0,
    };
  }, [items]);

  const discount = shippingMethod === 'self_pickup' ? totalPrice * 0.10 : 0;
  const totalToPay = totalPrice + baseShippingFee + extraShippingFee - discount;

  // Fetch authors data on mount
  useEffect(() => {
    async function fetchAuthors() {
      const authorIds = Object.keys(itemsByAuthor);
      const data: Record<string, User> = {};
      for (const id of authorIds) {
        const u = await getUserById(id);
        if (u) data[id] = u;
      }
      setAuthorsData(data);
    }
    fetchAuthors();
  }, [itemsByAuthor]);

  // Live Distance Calculation Effect
  useEffect(() => {
    if (shippingMethod !== 'direct') {
      setExtraShippingFee(0);
      return;
    }

    if (!watchAddress || !watchCity || watchAddress.length < 3 || watchCity.length < 2) {
      setExtraShippingFee(0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCalculatingDistance(true);
      
      let hasFarAuthor = false;
      const customerAddr = `${watchAddress}, ${watchCity}, ${watchZip || ''}`;

      const authorIds = Object.keys(itemsByAuthor);
      for (const authorId of authorIds) {
        const authorUser = authorsData[authorId];
        if (authorUser?.pickupAddress?.city) {
          const authorAddr = `${authorUser.pickupAddress.street}, ${authorUser.pickupAddress.city}, ${authorUser.pickupAddress.zip || ''}`;
          const distance = await calculateDistance(authorAddr, customerAddr);
          
          if (distance !== null && distance > 40) {
            hasFarAuthor = true;
          }
        }
      }

      if (hasFarAuthor) {
        setExtraShippingFee(15);
        setShowDistanceModal(true);
      } else {
        setExtraShippingFee(0);
      }
      
      setIsCalculatingDistance(false);
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [watchAddress, watchCity, watchZip, shippingMethod, authorsData, itemsByAuthor]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;
    
    if (shippingMethod === 'direct') {
      if (!data.address || !data.city) {
        alert("נא להזין כתובת ועיר למשלוח.");
        return;
      }
    }
    
    if (shippingMethod === 'pickup_point') {
       // Cannot submit if pickup points are unavailable
       alert("מערכת נקודות החלוקה אינה זמינה כרגע. אנא בחר שיטת משלוח אחרת.");
       return;
    }

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
      
      if (!response.ok) throw new Error(responseData.error || 'Failed to generate checkout link');
      
      clearCart();
      
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

  const cancelDistanceSurcharge = () => {
    setShowDistanceModal(false);
    setExtraShippingFee(0);
    setValue('address', '');
    setValue('city', '');
    setValue('zip', '');
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
    <div className="min-h-screen bg-gray-50 py-12 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="text-3xl font-black text-gray-900">קופה מובטחת</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Form Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="text-green-600" />
                שיטת משלוח
              </h2>

              {/* Early-stage platform notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-0.5">שימו לב — שלב ראשון של הפלטפורמה 🚀</p>
                  <p>זוהי תחילתו של BookToTable. בשלב זה המשלוחים מנוהלים ישירות מול הסופר. בהמשך האתר יתחבר לחברת שליחויות לניהול אוטומטי מלא. אנחנו מתנצלים על כל אי-נוחות זמנית ומודים לכם על הסבלנות! 🙏</p>
                </div>
              </div>
              
              {/* Dynamic shipping options based on author settings */}
              {(() => {
                const authorIds = Object.keys(itemsByAuthor);
                // Merge shipping options across all authors: only show method if ALL authors support it
                const mergedOptions = authorIds.reduce((acc, authorId) => {
                  const opts = authorsData[authorId]?.shippingOptions;
                  // If no shippingOptions set yet (legacy), default to direct=true
                  const direct = opts ? opts.direct : true;
                  const pickupPoint = opts ? opts.pickupPoint : false;
                  const selfPickup = opts ? opts.selfPickup : false;
                  return {
                    direct: acc.direct && direct,
                    pickupPoint: acc.pickupPoint && pickupPoint,
                    selfPickup: acc.selfPickup && selfPickup,
                  };
                }, { direct: true, pickupPoint: true, selfPickup: true });

                // If no authors loaded yet, show all (will refine once loaded)
                const hasAuthors = authorIds.length > 0 && Object.keys(authorsData).length > 0;
                const showDirect = !hasAuthors || mergedOptions.direct;
                const showPickupPoint = !hasAuthors || mergedOptions.pickupPoint;
                const showSelfPickup = !hasAuthors || mergedOptions.selfPickup;

                // Ensure selected method is valid
                if (hasAuthors) {
                  if (shippingMethod === 'direct' && !showDirect) setShippingMethod(showPickupPoint ? 'pickup_point' : 'self_pickup');
                  if (shippingMethod === 'pickup_point' && !showPickupPoint) setShippingMethod(showDirect ? 'direct' : 'self_pickup');
                  if (shippingMethod === 'self_pickup' && !showSelfPickup) setShippingMethod(showDirect ? 'direct' : 'pickup_point');
                }

                return (
                  <div className={`grid grid-cols-1 gap-4 mb-8 ${
                    [showDirect, showPickupPoint, showSelfPickup].filter(Boolean).length === 1 ? 'md:grid-cols-1 max-w-sm' :
                    [showDirect, showPickupPoint, showSelfPickup].filter(Boolean).length === 2 ? 'md:grid-cols-2' :
                    'md:grid-cols-3'
                  }`}>
                    {showDirect && (
                      <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${shippingMethod === 'direct' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="shippingMethod" className="sr-only" checked={shippingMethod === 'direct'} onChange={() => setShippingMethod('direct')} />
                        <Truck size={28} className={`mb-2 ${shippingMethod === 'direct' ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="font-bold text-gray-900">משלוח עד הבית</span>
                        <span className="text-xs text-gray-500 mt-1">יגיע ישירות מהסופר אליך</span>
                      </label>
                    )}

                    {showPickupPoint && (
                      <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${shippingMethod === 'pickup_point' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="shippingMethod" className="sr-only" checked={shippingMethod === 'pickup_point'} onChange={() => setShippingMethod('pickup_point')} />
                        <MapPin size={28} className={`mb-2 ${shippingMethod === 'pickup_point' ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="font-bold text-gray-900">נקודת חלוקה</span>
                        <span className="text-xs text-gray-500 mt-1">איסוף מלוקר או חנות קרובה</span>
                        <span className="text-xs text-orange-500 font-bold mt-1">בקרוב!</span>
                      </label>
                    )}

                    {showSelfPickup && (
                      <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${shippingMethod === 'self_pickup' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="shippingMethod" className="sr-only" checked={shippingMethod === 'self_pickup'} onChange={() => setShippingMethod('self_pickup')} />
                        <Store size={28} className={`mb-2 ${shippingMethod === 'self_pickup' ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="font-bold text-gray-900">איסוף עצמי</span>
                        <span className="text-xs text-gray-500 mt-1">ללא עלות, איסוף פיזי מהסופר</span>
                        <span className="text-xs text-green-600 font-bold mt-1">הנחה 10%!</span>
                      </label>
                    )}

                    {!showDirect && !showPickupPoint && !showSelfPickup && (
                      <div className="col-span-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center text-sm">
                        <p className="font-bold mb-1">הסופר טרם הגדיר אפשרויות משלוח</p>
                        <p>אנא צור קשר עם הסופר לפני ביצוע ההזמנה.</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {shippingMethod === 'pickup_point' && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 p-6 rounded-xl flex items-start gap-4">
                  <Info className="shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">שירות נקודות חלוקה — בקרוב!</h3>
                    <p className="text-sm">הצוות שלנו עובד על חיבור לחברת שליחויות עם רשת נקודות חלוקה ולוקרים בכל רחבי הארץ. השירות יהיה זמין בהמשך. בינתיים אנא בחר שיטת משלוח אחרת.</p>
                  </div>
                </div>
              )}

              {shippingMethod === 'self_pickup' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-xl">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><Store size={18} /> פרטי איסוף (מהסופרים):</h3>
                  <ul className="space-y-3 text-sm">
                    {Object.keys(itemsByAuthor).map(authorId => {
                      const authorUser = authorsData[authorId];
                      return (
                        <li key={authorId} className="bg-white/60 p-3 rounded-lg border border-blue-100">
                          <strong>{authorUser?.name || 'סופר'}:</strong><br/>
                          {authorUser?.pickupAddress ? (
                            <>
                              {authorUser.pickupAddress.street}, {authorUser.pickupAddress.city}<br/>
                              טלפון לתיאום: <span dir="ltr">{authorUser.pickupAddress.phone}</span>
                            </>
                          ) : (
                            <span className="text-gray-500">הסופר טרם הזין כתובת לאיסוף. אנא צור קשר במייל: {authorUser?.email}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-4 text-xs font-medium">* חובה לתאם הגעה מראש מול הסופר לאחר התשלום.</p>
                </div>
              )}
            </div>

            {/* Personal Details Form */}
            {(shippingMethod === 'direct' || shippingMethod === 'self_pickup') && (
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">פרטי המזמין</h2>
                
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

                  {shippingMethod === 'direct' && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4">כתובת למשלוח</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-1">רחוב ומספר בית *</label>
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
                          <label className="block text-sm font-bold text-gray-700 mb-1">מיקוד (אופציונלי)</label>
                          <input
                            {...register('zip')}
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        
                        {/* Live Distance Indicator */}
                        {isCalculatingDistance && (
                          <div className="absolute -bottom-8 right-0 flex items-center text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            <Loader2 size={12} className="animate-spin ml-1.5" /> בודק אפשרויות משלוח...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
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
              </form>
            )}
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
                {shippingMethod === 'direct' && (
                  <>
                    <div className="flex justify-between">
                      <span>משלוח רגיל</span>
                      <span className="text-green-600 font-bold">חינם</span>
                    </div>
                    {extraShippingFee > 0 && (
                      <div className="flex justify-between text-red-600 font-bold">
                        <span>תוספת מרחק חריג</span>
                        <span>₪{extraShippingFee.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                {shippingMethod === 'self_pickup' && (
                  <div className="flex justify-between">
                    <span>איסוף עצמי (10% הנחה)</span>
                    <span className="text-green-600 font-bold">-₪{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-200 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">לתשלום סופי</span>
                  <span className="text-3xl font-black text-green-700">₪{totalToPay.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  <strong>תשלום ישיר לסופר:</strong> בסיום תועבר לתשלום מאובטח ישירות לחשבון של הסופר/ים (ללא עמלות תיווך).
                </p>
              </div>
              
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || shippingMethod === 'pickup_point'}
                className="w-full flex items-center justify-center bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
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

      {/* Distance Modal Surcharge */}
      {showDistanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900">תוספת משלוח למרחק</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed text-center">
                לקוח יקר, זיהינו כי כתובת המשלוח שהזנת רחוקה במיוחד מכתובת האריזה של הסופר (מעל 40 ק"מ). 
                <br/><br/>
                בהתאם לכך, חברת השליחויות דורשת תוספת של <strong>{extraShippingFee} ₪</strong> לדמי המשלוח. הסכום הכולל עודכן בסיכום ההזמנה.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowDistanceModal(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md"
                >
                  הבנתי ואישרתי (הוסף לסכום)
                </button>
                
                <button 
                  onClick={cancelDistanceSurcharge}
                  className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl transition-all"
                >
                  אני אשנה את כתובת המשלוח
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
