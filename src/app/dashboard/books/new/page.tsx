'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { createBook } from '@/lib/firestore';
import { uploadFile } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const bookSchema = z.object({
  title: z.string().min(2, 'כותרת הספר חייבת להכיל לפחות 2 תווים'),
  description: z.string().min(10, 'תיאור הספר חייב להכיל לפחות 10 תווים'),
  price: z.number().min(1, 'מחיר חייב להיות לפחות 1 ש"ח'),
  weightGrams: z.number().min(50, 'משקל הספר בגרמים חסר או נמוך מדי'),
  genre: z.string().optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

export default function AddBookPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Image Upload State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (data: BookFormData) => {
    if (!user) return alert("עליך להתחבר כדי להוסיף ספר");
    if (!coverFile) return alert("חובה להעלות תמונת כריכה לספר");

    setIsSubmitting(true);
    try {
      // 1. Upload Cover Image to Firebase Storage
      const filePath = `covers/${user.id}_${Date.now()}_${coverFile.name}`;
      const coverUrl = await uploadFile(coverFile, filePath, (progress) => {
        setUploadProgress(progress);
      });

      // 2. Create Book document in Firestore
      await createBook({
        authorId: user.id,
        authorName: user.name,
        title: data.title,
        description: data.description,
        price: data.price,
        weightGrams: data.weightGrams,
        genre: data.genre || '',
        coverUrl: coverUrl,
        isPublished: true, // Auto publish for now
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error("Failed to add book:", error);
      alert("אירעה שגיאה בהעלאת הספר. ודא שהמפתחות וההרשאות של Firebase מוגדרים נכון.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">הספר הועלה בהצלחה!</h2>
        <p className="text-gray-600">הספר זמין כעת בחנות וקוראים יכולים לרכוש אותו.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-600 mb-4 transition-colors">
          <ArrowRight size={16} className="ml-1" />
          חזרה ללוח הבקרה
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900">הוספת ספר חדש</h1>
        <p className="text-gray-500 mt-2">מלא את הפרטים הבאים כדי להוסיף ספר חדש לחנות שלך.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Form Fields */}
            <div className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">כותרת הספר *</label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                  placeholder="לדוגמה: הארי פוטר ואבן החכמים"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">תקציר / תיאור *</label>
                <textarea
                  {...register('description')}
                  rows={5}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all resize-none"
                  placeholder="ספר קצת על העלילה, הדמויות ומה שהופך את הספר למיוחד..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">מחיר (₪) *</label>
                  <input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    placeholder="79"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">משקל (גרם) *</label>
                  <input
                    {...register('weightGrams', { valueAsNumber: true })}
                    type="number"
                    min="50"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    placeholder="350"
                  />
                  {errors.weightGrams && <p className="mt-1 text-sm text-red-600">{errors.weightGrams.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ז'אנר</label>
                <input
                  {...register('genre')}
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                  placeholder="לדוגמה: מתח, פנטזיה, עיון..."
                />
              </div>

            </div>

            {/* Right Column: Image Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">תמונת כריכה *</label>
              
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Cover preview" className="mx-auto h-64 object-contain shadow-sm rounded" />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center mt-4">
                    <span className="relative rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                      לחץ כאן כדי להעלות תמונה
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG עד 5MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
              {!coverFile && <p className="mt-2 text-sm text-red-500">* חובה להעלות תמונה</p>}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !coverFile}
              className="flex items-center justify-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all w-full md:w-auto min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 ml-2" size={20} />
                  {uploadProgress > 0 && uploadProgress < 100 
                    ? `מעלה... ${Math.round(uploadProgress)}%` 
                    : 'שומר נתונים...'}
                </>
              ) : (
                'פרסם ספר בחנות'
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
