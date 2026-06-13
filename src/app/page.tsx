import { ArrowRight, BookOpen, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import BookCarousel from '@/components/marketplace/BookCarousel';
import { getBooks } from '@/lib/firestore';

export const revalidate = 0;

export default async function HomePage() {
  const [booksResult] = await Promise.allSettled([
    getBooks(24),
  ]);

  const booksData = booksResult.status === 'fulfilled' ? booksResult.value : [];

  return (
    <div className="page-transition bg-white min-h-screen">
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40 z-10"></div>
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
          <span className="bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide shadow-sm">חדש!</span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            הבית של <span className="text-green-400">הסופרים העצמאיים</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 font-medium leading-relaxed max-w-3xl">
            פלטפורמה מהפכנית שמאפשרת לסופרים למכור את הספרים שלהם ישירות אליך - בלי פערי תיווך, ובלי רשתות שלוקחות את רוב הרווח.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/books" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center">
              חנות הספרים <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link href="/authors/join" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center">
              הצטרפות כסופר
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-6">איך זה עובד?</h2>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              הקמנו את BookToTable במטרה אחת: להחזיר את הכוח לידיים של הסופרים. כשאתה קונה ספר דרכנו, הכסף עובר ישירות לחשבון של הסופר, והוא זה שאורז ושולח לך את הספר הביתה באהבה.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. בוחרים ספר</h3>
              <p className="text-gray-500 font-medium">מתוך מאגר גדל של סופרים ישראלים מוכשרים וספרים מרתקים.</p>
            </div>
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. משלמים באבטחה</h3>
              <p className="text-gray-500 font-medium">מערכת התשלומים שלנו דואגת שהכסף (90%) יעבור ישירות לסופר באופן מיידי.</p>
            </div>
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. מקבלים עד הבית</h3>
              <p className="text-gray-500 font-medium">הסופר עצמו אורז ושולח את הספר, ולעיתים גם מוסיף הקדשה אישית.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">ספרים פופולריים</h2>
              <p className="text-gray-500 font-medium">הספרים שהכי אהבתם לקרוא לאחרונה</p>
            </div>
            <Link href="/books" className="hidden sm:flex items-center text-green-600 font-bold hover:text-green-700 transition-colors bg-green-50 px-5 py-2.5 rounded-full">
              לכל הספרים <ArrowRight className="mr-2" size={18} />
            </Link>
          </div>
          
          <BookCarousel title="" books={booksData} />
          
          <div className="mt-10 text-center sm:hidden">
            <Link href="/books" className="inline-flex items-center justify-center bg-green-100 text-green-700 font-bold px-6 py-3 rounded-xl w-full">
              לכל הספרים
            </Link>
          </div>
        </div>
      </section>

      {booksData.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">אין כרגע ספרים בחנות. בקרוב יעלו ספרים חדשים!</p>
        </div>
      )}
    </div>
  );
}
