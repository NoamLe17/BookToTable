import React from 'react';
import Link from 'next/link';
import { ArrowRight, Info, Monitor, Mail, Heart } from 'lucide-react';

export const metadata = {
  title: 'הצהרת נגישות | BookToTable',
  description: 'הצהרת הנגישות של אתר BookToTable - הפלטפורמה להעצמת סופרים עצמאיים בישראל.',
};

export default function AccessibilityPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-green-600 transition-colors mb-8 font-medium">
          <ArrowRight className="ml-2" size={20} />
          חזרה לדף הבית
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-gray-900 mb-4">הצהרת נגישות</h1>
            <p className="text-gray-500 font-medium">תאריך עדכון אחרון: יוני 2026</p>
          </div>

          <div className="prose prose-green max-w-none text-gray-700">
            <p className="lead font-medium text-gray-900">
              אנו ב-BookToTable רואים חשיבות עליונה במתן שירות שוויוני, מכובד, נגיש ומקצועי לכלל ציבור הגולשים והלקוחות שלנו, לרבות אנשים עם מוגבלויות. אנו פועלים רבות במטרה לאפשר לאנשים עם מוגבלות חוויית גלישה קלה ונוחה.
            </p>

            <div className="flex items-center gap-3 mt-10 mb-6 border-b pb-2">
              <Monitor className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900 m-0">נגישות האתר</h2>
            </div>

            <p>
              אתר האינטרנט שלנו הונגש בהתאם להוראות חוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998, ותקנותיו. 
              האתר עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג 2013.
              התאמות הנגישות בוצעו עפ"י המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA, והמסמך הבינלאומי WCAG 2.1.
            </p>

            <h3 className="text-xl font-bold text-gray-900">מה בוצע באתר?</h3>
            <ul className="list-disc pr-6 space-y-2">
              <li>האתר מותאם לתצוגה בדפדפנים הנפוצים ולשימוש בטלפונים הסלולריים.</li>
              <li>התאמה לניווט בעזרת המקלדת – ניתן לנווט באתר באמצעות מקשי ה-Tab וה-Enter.</li>
              <li>תמיכה בתוכנות קוראות מסך (כגון NVDA) המסייעות לעיוורים ולקויי ראייה.</li>
              <li>יצירת היררכיה ברורה של כותרות (H1, H2, H3) בכל עמודי האתר לטובת ניווט נוח לקוראי מסך.</li>
              <li>הוספת תגיות חלופיות (Alt) לתמונות משמעותיות המופיעות באתר.</li>
              <li>עיצוב האתר בצבעים בעלי ניגודיות גבוהה כדי להקל על לקויי ראייה.</li>
            </ul>

            <div className="flex items-center gap-3 mt-12 mb-6 border-b pb-2">
              <Info className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900 m-0">הסדרי נגישות פיזיים</h2>
            </div>

            <p>
              BookToTable הינה פלטפורמה טכנולוגית דיגיטלית הפועלת באינטרנט בלבד (Marketplace). אי לכך, <strong>אין לחברה משרדים עם קבלת קהל פיזית</strong>.
              כלל השירותים הניתנים בפלטפורמה שלנו מבוצעים באופן מקוון ומרחוק – החל מעיון בספרים, רכישתם, ועד רישום כסופר לפלטפורמה. השילוח נעשה באופן ישיר על ידי הסופרים באמצעות חברות שילוח חיצוניות.
            </p>

            <div className="flex items-center gap-3 mt-12 mb-6 border-b pb-2">
              <Heart className="text-red-500" size={28} />
              <h2 className="text-2xl font-bold text-gray-900 m-0">פניות בנושא נגישות ותקלות</h2>
            </div>

            <p>
              אנו ממשיכים במאמצים לשפר את נגישות האתר כחלק ממחויבותנו לאפשר לכלל האוכלוסייה, לרבות אנשים עם מוגבלויות, לקבל את השירות הנגיש ביותר. 
              חשוב לציין כי למרות מאמצינו להנגיש את כלל הדפים באתר, יתכן שיתגלו חלקים ספציפיים שטרם הונגשו במלואם או שקיימת תקלה טכנולוגית שמונעת נגישות מושלמת.
            </p>
            <p>
              אם במהלך הגלישה באתר נתקלתם בבעיה בנושא נגישות, נשמח מאוד לקבל מכם משוב כדי שנוכל לתקן ולשפר את חווית הגלישה.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 mt-0">פרטי קשר - פניות בנושא נגישות:</h3>
              <ul className="space-y-3 p-0 m-0 list-none">
                <li className="flex items-center gap-3 text-gray-700">
                  <Mail className="text-green-600" size={20} />
                  <span><strong>דואר אלקטרוני:</strong> <a href="mailto:noamhemo2001@gmail.com" className="text-green-600 hover:text-green-800">noamhemo2001@gmail.com</a></span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
