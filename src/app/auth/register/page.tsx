'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { BookOpen, Upload, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  email: z.string().email('כתובת אימייל לא חוקית'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
  bio: z.string().max(500, 'ביוגרפיה ארוכה מדי').optional(),
  phone: z.string().min(9, 'מספר טלפון לא חוקי'),
  pickupCity: z.string().min(2, 'עיר איסוף נדרשת'),
  pickupStreet: z.string().min(2, 'רחוב איסוף נדרש'),
  pickupZip: z.string().min(5, 'מיקוד נדרש'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthorRegisterPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      // Create user in Firebase via useAuth hook
      await registerAuth(data.email, data.password, data.name, false, {
        phone: data.phone,
        city: data.pickupCity,
        street: data.pickupStreet,
        zip: data.pickupZip
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      // Handled by toast in useAuth usually, but we could add local error state
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">ברוכים הבאים ל-BookToTable!</h2>
          <p className="text-gray-600">החשבון נוצר בהצלחה. מעביר אותך ללוח הבקרה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex mt-16 md:mt-24">
      {/* Left side - Image/Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-green-900 flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=1600&auto=format&fit=crop"
            alt="Author writing"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-green-400" />
          </div>
          <h2 className="text-4xl font-black mb-6">הגיע הזמן למכור ישירות לקוראים שלך.</h2>
          <ul className="space-y-4 text-right text-lg text-green-50">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400 flex-shrink-0" />
              <span>100% מהרווח נשאר אצלך, תמיד.</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400 flex-shrink-0" />
              <span>שליטה מלאה על המחיר והמלאי.</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400 flex-shrink-0" />
              <span>חיבור ישיר לקהל הקוראים שלך.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">הצטרפות כסופר</h2>
            <p className="mt-2 text-sm text-gray-600">
              כבר יש לך חשבון?{' '}
              <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-500">
                התחבר כאן
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  שם מלא / שם עט
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="ישראל ישראלי"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  כתובת אימייל
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  סיסמה
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              {/* Bio (Optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ספר לנו קצת על עצמך (אופציונלי)
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm resize-none"
                  placeholder="סופר ילדים, אוהב חתולים..."
                />
                {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  טלפון נייד
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="050-0000000"
                  dir="ltr"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              {/* Pickup Address */}
              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-md font-bold text-gray-900 mb-4">כתובת איסוף חבילות (לשליח)</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">עיר</label>
                      <input
                        {...register('pickupCity')}
                        type="text"
                        className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                      />
                      {errors.pickupCity && <p className="mt-1 text-sm text-red-600">{errors.pickupCity.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">מיקוד</label>
                      <input
                        {...register('pickupZip')}
                        type="text"
                        className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                      />
                      {errors.pickupZip && <p className="mt-1 text-sm text-red-600">{errors.pickupZip.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">רחוב ומספר</label>
                    <input
                      {...register('pickupStreet')}
                      type="text"
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                      placeholder="הרקפת 12, דירה 4"
                    />
                    {errors.pickupStreet && <p className="mt-1 text-sm text-red-600">{errors.pickupStreet.message}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all"
                >
                  {isSubmitting ? 'יוצר חשבון...' : 'צור חשבון סופר'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              בלחיצה על "צור חשבון סופר" אתה מסכים ל
              <Link href="#" className="font-medium text-green-600 hover:text-green-500 mx-1">
                תנאי השימוש
              </Link>
              ולמדיניות הפרטיות שלנו.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
