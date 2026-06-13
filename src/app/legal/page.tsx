import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Scale, Lock } from 'lucide-react';

export const metadata = {
  title: 'תקנון ומדיניות פרטיות | BookToTable',
  description: 'תקנון האתר, תנאי שימוש ומדיניות פרטיות של פלטפורמת BookToTable.',
};

export default function LegalPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-green-600 transition-colors mb-8 font-medium">
          <ArrowRight className="ml-2" size={20} />
          חזרה לדף הבית
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-gray-900 mb-4">תקנון ומדיניות פרטיות</h1>
            <p className="text-gray-500 font-medium">עודכן לאחרונה: יוני 2026</p>
          </div>

          {/* TOS Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                <Scale size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">תקנון האתר (תנאי שימוש)</h2>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
              <p>ברוכים הבאים לאתר BookToTable (להלן: "הפלטפורמה" או "האתר"). השימוש באתר כפוף לתנאים המפורטים מטה.</p>
              
              <h3 className="font-bold text-gray-900 text-lg pt-4">1. מהות הפלטפורמה (פלטפורמת תיווך בלבד)</h3>
              <p>BookToTable משמשת כפלטפורמת תיווך המאפשרת לסופרים עצמאיים להציג את ספריהם ולמכור אותם ישירות לקוראים.</p>
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-yellow-800 font-medium">
                האתר אינו מוכר, מספק, שולח או מחזיק במלאי של הספרים המוצגים. כל עסקה המבוצעת דרך האתר היא חוזה ישיר ובלעדי בין <strong>הרוכש</strong> לבין <strong>הסופר הרלוונטי</strong>.
              </div>

              <h3 className="font-bold text-gray-900 text-lg pt-4">2. תשלומים, סליקה והחזרים</h3>
              <p>במודל הנוכחי, הפלטפורמה אינה סולקת כספים בעצמה. התשלומים מבוצעים ישירות מהקורא אל הסופר באמצעות קישורי תשלום חיצוניים (כגון Paybox, Bit, או דפי נחיתה לסליקת אשראי באחריות הסופר).</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>האחריות המלאה לווידוא קבלת התשלום חלה על הסופר בלבד.</li>
                <li>כל בקשה לביטול עסקה או החזר כספי תתבצע ישירות מול הסופר שממנו נרכש הספר, בהתאם לחוק הגנת הצרכן. הפלטפורמה אינה צד לעסקה ואינה אחראית להחזרים.</li>
              </ul>

              <h3 className="font-bold text-gray-900 text-lg pt-4">3. משלוחים וזמני אספקה</h3>
              <p>אריזת הספרים ושליחתם הינה באחריותו הבלעדית של הסופר. האתר מספק לסופרים כלים להזנת מספר מעקב, אך אינו נושא באחריות לאיחורים, אובדן דואר או נזק שנגרם למוצר בדרך.</p>
            </div>
          </section>

          <hr className="border-gray-100 my-12" />

          {/* Privacy Policy Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">מדיניות פרטיות</h2>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
              <p>אנו ב-BookToTable מכבדים את פרטיותך ופועלים על מנת להגן על המידע האישי שלך.</p>

              <h3 className="font-bold text-gray-900 text-lg pt-4">1. איסוף מידע</h3>
              <p>בעת ביצוע הזמנה, אנו אוספים מידע בסיסי הכרחי כגון: שם מלא, כתובת למשלוח, אימייל ומספר טלפון. מידע זה מועבר לסופר הרלוונטי <strong>אך ורק לצורך אספקת ההזמנה ושליחתה</strong>.</p>

              <h3 className="font-bold text-gray-900 text-lg pt-4">2. אבטחת מידע ותשלומים</h3>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 font-medium">
                הפלטפורמה <strong>אינה שומרת ואינה חשופה</strong> לפרטי כרטיס האשראי שלך.
              </div>
              <p>מאחר והתשלומים מבוצעים מחוץ לפלטפורמה (באמצעות פייבוקס, ביט או חברות סליקה צד-שלישי שמוגדרות על ידי הסופרים), המידע הפיננסי שלך נשאר מאובטח בידי ספקי התשלום עצמם ואינו עובר בשרתי האתר.</p>

              <h3 className="font-bold text-gray-900 text-lg pt-4">3. שמירת נתונים</h3>
              <p>האתר מאוחסן בשרתי ענן מאובטחים. הסופרים הרשומים מתחייבים להשתמש בפרטי הרוכשים לצורך אספקת המוצר בלבד, ואינם רשאים להשתמש בהם לצרכים שיווקיים ללא הסכמה מפורשת מראש.</p>
            </div>
          </section>

          <div className="mt-16 text-center text-gray-500 text-sm">
            יש לכם שאלות? מוזמנים לפנות אלינו דרך עמוד הפייסבוק שלנו או במייל התמיכה.
          </div>
        </div>
      </div>
    </div>
  );
}
