import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, HelpCircle, BookOpen, CreditCard, Truck, ShieldCheck, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'שאלות נפוצות | BookToTable',
  description: 'תשובות לשאלות הנפוצות ביותר על BookToTable — איך קונים ספרים, איך התשלום עובד, משלוחים, ועוד. הפלטפורמה הישראלית שמחברת סופרים עצמאיים ישירות לקוראים.',
  alternates: {
    canonical: 'https://www.booktotable.com/faq',
  },
  openGraph: {
    title: 'שאלות נפוצות | BookToTable',
    description: 'תשובות לשאלות הנפוצות ביותר על BookToTable — הפלטפורמה להעצמת סופרים עצמאיים בישראל.',
    url: 'https://www.booktotable.com/faq',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'מה זה BookToTable?',
    answer: 'BookToTable היא הפלטפורמה הראשונה בישראל שמאפשרת לסופרים עצמאיים למכור ספרים ישירות לקוראים — ללא עמלות תיווך, ללא מתווכים, ובלי שרשתות הספרים הגדולות לוקחות חלק מהרווח. הסופר שומר 100% מהמכירה.',
    icon: BookOpen,
  },
  {
    question: 'איך הספרים מגיעים אליי?',
    answer: 'הספרים נשלחים ישירות מבית הסופר. ברגע שאתה רוכש, הסופר מקבל התראה, אורז את הספר באהבה ושולח אותו אליך. לעיתים קרובות הסופרים גם מוסיפים הקדשה אישית!',
    icon: Truck,
  },
  {
    question: 'איך התשלום מועבר לסופר?',
    answer: 'במודל הייחודי שלנו, התשלום מבוצע ישירות מהקורא לסופר (דרך Paybox, Bit, או אשראי). הסופר מקבל 100% מהסכום שהעברת אליו, ללא עמלות תיווך לפלטפורמה.',
    icon: CreditCard,
  },
  {
    question: 'מה קורה אם קניתי ספרים משני סופרים שונים?',
    answer: 'תשלם דמי משלוח עבור כל סופר בנפרד (מכיוון שיוצאות שתי חבילות משני בתים שונים), אך חווית הרכישה בקופה היא מרוכזת ואחת.',
    icon: Users,
  },
  {
    question: 'האם התשלום באתר מאובטח?',
    answer: 'בהחלט! האתר מאובטח בפרוטוקול SSL. נתוני האשראי שלך מוזנים ישירות במערכות סליקה חיצוניות (בעלות תקן PCI DSS) ואינם נשמרים בשרתי BookToTable.',
    icon: ShieldCheck,
  },
  {
    question: 'איך אפשר להצטרף כסופר?',
    answer: 'ההצטרפות חינמית ופשוטה! נרשמים באתר, ממלאים פרופיל סופר, מעלים את הספרים ומתחילים למכור. כל התהליך לוקח פחות מ-5 דקות.',
    icon: BookOpen,
  },
  {
    question: 'כמה זה עולה למכור ספרים באתר?',
    answer: 'כרגע — חינם לחלוטין! אנחנו בשלב בניית הקהילה ולכן לא גובים עמלה. בעתיד, תתווסף עמלה קטנה כדי לתחזק שרתים ולפתח את הפלטפורמה. כל שינוי יפורסם 30 יום מראש.',
    icon: CreditCard,
  },
  {
    question: 'מהם זמני המשלוח?',
    answer: 'זמני המשלוח תלויים בסופר ובשיטת המשלוח שנבחרה. בדרך כלל, משלוח בדואר רשום לוקח 2-5 ימי עסקים, ומשלוח עם חברת שליחויות מגיע תוך יום עסקים אחד.',
    icon: Truck,
  },
];

export default function FaqPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      {/* FAQ JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-green-600 transition-colors mb-8 font-medium">
          <ArrowRight className="ml-2" size={20} />
          חזרה לדף הבית
        </Link>

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">שאלות נפוצות</h1>
          <p className="text-gray-500 font-medium text-lg max-w-xl mx-auto">
            כל מה שרציתם לדעת על BookToTable — הפלטפורמה שמחברת ישירות בין סופרים לקוראים.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            return (
              <details 
                key={index} 
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                open={index === 0}
              >
                <summary className="flex items-center gap-4 p-5 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </div>
                  <span className="flex-1 text-right font-bold text-gray-900 text-base sm:text-lg">{faq.question}</span>
                  <div className="shrink-0 text-gray-400 transition-transform group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </summary>
                <div className="px-5 sm:px-6 pb-6 pt-1">
                  <div className="border-t border-gray-100 pt-5 text-gray-700 text-base leading-relaxed pr-14">
                    {faq.answer}
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-black mb-3">לא מצאתם תשובה?</h2>
          <p className="text-green-100 mb-6 font-medium">אנחנו כאן בשבילכם — שלחו לנו הודעה ונחזור אליכם בהקדם.</p>
          <a
            href="mailto:noamhemo2001@gmail.com"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-7 py-3 rounded-xl hover:bg-green-50 transition-colors"
          >
            צרו קשר
          </a>
        </div>

        {/* Additional Links for SEO internal linking */}
        <div className="mt-8 text-center text-sm text-gray-500 space-x-4 space-x-reverse">
          <Link href="/books" className="hover:text-green-600 transition-colors">חנות הספרים</Link>
          <span>·</span>
          <Link href="/about" className="hover:text-green-600 transition-colors">אודות</Link>
          <span>·</span>
          <Link href="/legal" className="hover:text-green-600 transition-colors">תקנון ומדיניות פרטיות</Link>
          <span>·</span>
          <Link href="/accessibility" className="hover:text-green-600 transition-colors">הצהרת נגישות</Link>
        </div>
      </div>
    </div>
  );
}
