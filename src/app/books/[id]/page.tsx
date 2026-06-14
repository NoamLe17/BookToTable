import React from 'react';
import { getBookById } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import { BookOpen, Truck, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from '@/components/marketplace/AddToCartButton';

export const revalidate = 0;

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<import('next').Metadata> {
  const resolvedParams = await params;
  const book = await getBookById(resolvedParams.id);
  
  if (!book) {
    return { title: 'ספר לא נמצא | BookToTable' };
  }

  return {
    title: `${book.title} מאת ${book.authorName} | BookToTable`,
    description: book.description.substring(0, 160) + '...',
    openGraph: {
      title: `${book.title} מאת ${book.authorName}`,
      description: book.description.substring(0, 160) + '...',
      images: book.coverUrl ? [{ url: book.coverUrl }] : [],
    },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  // Await the params promise in Next.js 16/Turbopack
  const resolvedParams = await params;
  const book = await getBookById(resolvedParams.id);

  if (!book) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-8 font-medium">
          <Link href="/" className="hover:text-green-600 transition-colors">ראשי</Link>
          <span className="mx-2">/</span>
          <Link href="/#books" className="hover:text-green-600 transition-colors">ספרים</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{book.title}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* Right Side - Book Details & Buy Action */}
            <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
              {book.genre && (
                <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4 w-max">
                  {book.genre}
                </span>
              )}
              
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-gray-500 font-medium mb-6">
                מאת: <span className="text-green-700 font-bold">{book.authorName}</span>
              </p>
              
              <div className="text-3xl font-black text-gray-900 mb-8">
                ₪{book.price.toFixed(2)}
              </div>

              <div className="prose prose-green text-gray-600 mb-10 max-w-none font-medium leading-relaxed">
                {book.description.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>

              {/* Purchase Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <AddToCartButton book={book} />
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center">
                  <Heart size={24} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">משלוח מהיר</h4>
                    <p className="text-xs text-gray-500 mt-0.5">ישירות מהסופר אליך הביתה</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">תשלום מאובטח</h4>
                    <p className="text-xs text-gray-500 mt-0.5">100% הגנה על הרכישה</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Left Side - Book Cover Image */}
            <div className="bg-gray-50 p-6 md:p-12 flex items-center justify-center order-1 md:order-2 border-r border-gray-100">
              <div className="relative w-48 sm:w-56 md:w-64 lg:w-72 aspect-[2/3] shadow-2xl rounded-r-2xl rounded-l-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={`כריכת הספר ${book.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <BookOpen size={64} className="mb-4" />
                    <span className="font-bold">אין תמונת כריכה</span>
                  </div>
                )}
                {/* Book spine effect */}
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-black/20 to-transparent z-10"></div>
                <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/30 z-20"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Book Specs */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">פרטים טכניים</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">פורמט</p>
              <p className="font-bold text-gray-900 flex items-center gap-2">
                <BookOpen size={16} className="text-green-600" /> ספר מודפס
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">משקל</p>
              <p className="font-bold text-gray-900">{book.weightGrams} גרם</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">הכנסה לסופר</p>
              <p className="font-bold text-gray-900">90% מהמכירה!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
