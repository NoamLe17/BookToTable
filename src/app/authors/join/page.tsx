'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  email: z.string().email('כתובת אימייל לא חוקית'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
  bio: z.string().max(500, 'ביוגרפיה ארוכה מדי').optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthorJoinPage() {
  const router = useRouter();
  const { register: registerAuth, loginWithGoogle } = useAuth();
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
      await registerAuth(data.email, data.password, data.name);
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">ברוכים הבאים ל-BookToTable!</h2>
          <p className="text-gray-600 font-medium">החשבון נוצר בהצלחה. מעביר אותך ללוח הבקרה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white flex">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=1600&auto=format&fit=crop" 
            alt="Author writing" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-green-900/40 to-gray-900/60"></div>
        </div>
        
        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl transform -rotate-6">
            <BookOpen size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-black mb-6 leading-tight">הגיע הזמן למכור ישירות לקוראים שלך.</h2>
          <ul className="space-y-4 text-right text-lg text-gray-200">
            <li className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="text-green-400 flex-shrink-0" size={24} />
              <span className="font-medium">90% מהרווח נשאר אצלך, תמיד.</span>
            </li>
            <li className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="text-green-400 flex-shrink-0" size={24} />
              <span className="font-medium">שליטה מלאה על המחיר והמלאי.</span>
            </li>
            <li className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="text-green-400 flex-shrink-0" size={24} />
              <span className="font-medium">חיבור ישיר ואותנטי לקהל הקוראים שלך.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">הצטרפות כסופר</h2>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              כבר יש לך חשבון?{' '}
              <Link href="/auth/login" className="font-bold text-green-600 hover:text-green-500">
                התחבר כאן
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  שם מלא / שם עט
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all shadow-sm"
                  placeholder="ישראל ישראלי"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600 font-medium">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  כתובת אימייל
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all shadow-sm"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  סיסמה
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all shadow-sm"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600 font-medium">{errors.password.message}</p>}
              </div>

              {/* Bio (Optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ספר/י לנו קצת על עצמך (אופציונלי)
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all shadow-sm resize-none"
                  placeholder="סופר ילדים, אוהב חתולים..."
                />
                {errors.bio && <p className="mt-1 text-sm text-red-600 font-medium">{errors.bio.message}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all hover:shadow-lg"
                >
                  {isSubmitting ? 'יוצר חשבון...' : 'צור חשבון סופר'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">או הרשמה מהירה</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      await loginWithGoogle();
                      setSuccess(true);
                      setTimeout(() => {
                        router.push('/dashboard');
                      }, 2000);
                    } catch (error) {
                      console.error('Google login failed:', error);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-70"
                >
                  <svg className="w-5 h-5 mr-2 ml-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  המשך עם גוגל
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              בלחיצה על "צור חשבון סופר" אתה מסכים ל
              <Link href="#" className="font-bold text-green-600 hover:text-green-500 mx-1">
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
