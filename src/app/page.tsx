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
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0A0F1A]">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-green-900/30 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-blue-900/20 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#0A0F1A_100%)]"></div>
          
          {/* Subtle Grid Pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-10">
          
          {/* Glassmorphic Badge */}
          <div className="group cursor-default inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-all duration-300">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-300 tracking-wide group-hover:text-white transition-colors">
              פלטפורמת הקריאה החדשה של ישראל
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            הבית של <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 animate-gradient-x">
              הסופרים העצמאיים
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 font-medium leading-relaxed max-w-3xl">
            מודל מהפכני שמאפשר לסופרים למכור ישירות אליך - <span className="text-white">בלי פערי תיווך</span> ובלי רשתות שלוקחות את רוב הרווח. הקורא מרוויח מחיר הוגן, הסופר מרוויח <span className="text-green-400">100% מהקנייה.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full sm:w-auto">
            <Link 
              href="/books" 
              className="group relative inline-flex items-center justify-center w-full sm:w-auto bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] hover:shadow-[0_0_60px_-15px_rgba(34,197,94,0.7)] hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center">
                חנות הספרים 
                <ArrowRight className="ml-2 transform group-hover:-translate-x-1 transition-transform" size={20} />
              </span>
            </Link>
            
            <Link 
              href="/auth/login" 
              className="group relative inline-flex items-center justify-center w-full sm:w-auto bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:-translate-y-1"
            >
              התחברות/הצטרפות כסופר
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span className="text-sm font-medium text-gray-300">תמיכה ישירה ביוצרים</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <span className="text-sm font-medium text-gray-300">תשלום ישיר ובטוח</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <span className="text-sm font-medium text-gray-300">משלוח עד הבית</span>
            </div>
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
              <p className="text-gray-500 font-medium">מערכת התשלומים שלנו דואגת שהכסף (100%) יעבור ישירות לסופר באופן מיידי.</p>
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
