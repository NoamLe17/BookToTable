import React from 'react';
import { BookOpen, Heart, Award, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-green-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000&auto=format&fit=crop" 
            alt="Library" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-8 transform rotate-3">
            <BookOpen size={40} className="text-green-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            להחזיר את הכוח<br />לידיים של הסופרים.
          </h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto font-medium leading-relaxed">
            אנחנו מאמינים שמי שכותב את הספר צריך להרוויח עליו.
            BookToTable משנה את כללי המשחק בשוק הספרים הישראלי ומחברת ישירות בין יוצרים לקוראים.
          </p>
        </div>
      </section>

      {/* The Problem & The Solution */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-6">הבעיה בשוק הספרים היום</h2>
              <div className="prose prose-lg text-gray-600 font-medium leading-relaxed">
                <p>
                  בישראל, כשאדם רוכש ספר בחנות ב-80 שקלים, במקרים רבים הסופר מקבל לכיסו שקלים בודדים בלבד (לעיתים פחות מ-5 שקלים!). רוב הכסף מתפזר בין רשתות הספרים, המפיצים, חנויות הנוחות וההוצאות לאור.
                </p>
                <p>
                  סופרים עצמאיים משקיעים עשרות אלפי שקלים בהפקה, עריכה, הגהה ועיצוב - אך נשארים חסרי אונים מול מערכת ההפצה הריכוזית שחותכת להם את אחוזי הרווח עד דק.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 shadow-sm relative">
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-green-500 rounded-xl transform rotate-12 flex items-center justify-center shadow-lg">
                <Heart size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-green-800 mb-6">הפתרון שלנו: BookToTable</h2>
              <div className="prose text-gray-700 font-medium leading-relaxed">
                <p>
                  הקמנו פלטפורמה טכנולוגית חכמה וישירה. סופרים נרשמים, פותחים חנות משלהם, ומעלים את הספרים שלהם לפלטפורמה בחינם.
                </p>
                <p>
                  הקוראים רוכשים את הספרים ישירות דרך האתר. אנחנו מטפלים בסליקה (באופן מאובטח לחלוטין) ובמערכת המשלוחים שתאסוף את הספר מבית הסופר ותמסור אותו לקורא.
                </p>
                <p className="font-bold text-xl text-green-700 mt-4">
                  התוצאה? הסופר שומר אצלו 90% מסכום המכירה.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">למה לקנות דרכנו?</h2>
            <p className="text-gray-500 font-medium">ככה כולם מרוויחים - גם הקוראים וגם הסופרים</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">תמיכה ישירה ביוצרים</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                כל שקל שאתם מוציאים כאן (בניכוי עמלת סליקה ופלטפורמה מינימלית) הולך ישירות לסופר האהוב עליכם, ומאפשר לו להמשיך ליצור.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">שקיפות ואבטחה</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                מערכת תשלומים מאובטחת ומעקב משלוחים מלא. אתם תמיד יודעים בדיוק איפה הספר שלכם ומתי הוא מגיע אליכם.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">קשר ישיר ואותנטי</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                הספר נשלח אליכם ישירות על ידי הסופר עצמו. פעמים רבות תזכו להקדשות אישיות, מכתבי תודה, ויחס שלא תקבלו בשום רשת גדולה.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">כתבתם ספר? בואו למכור אצלנו!</h2>
          <p className="text-xl text-gray-600 font-medium mb-10">
            הצטרפו למהפכה של סופרים עצמאיים בישראל. פתיחת החנות לוקחת פחות מדקה ואינה כרוכה בעלות הקמה.
          </p>
          <Link 
            href="/authors/join"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full text-lg shadow-md hover:shadow-lg transition-all"
          >
            להצטרפות כסופר - חינם
          </Link>
        </div>
      </section>
    </div>
  );
}
