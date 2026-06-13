import React from 'react';
import { Shield, FileText } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">תנאי שימוש ומדיניות פרטיות</h1>
          <p className="text-lg text-gray-500 font-medium">עודכן לאחרונה: יוני 2026</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-12">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="text-green-600" /> מבוא והסרת אחריות (Marketplace)
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                ברוכים הבאים לפלטפורמת BookToTable ("האתר" או "הפלטפורמה"). האתר משמש כפלטפורמת תיווך בלבד (Marketplace) המקשרת בין סופרים ישראלים עצמאיים ("המוכרים") לבין קוראים ("הקונים").
              </p>
              <p className="font-bold text-gray-900 bg-gray-50 p-4 rounded-lg border-r-4 border-green-600">
                BookToTable אינה מוכרת, אורזת, או שולחת את הספרים בעצמה, ולכן אינה נושאת באחריות לטיב המוצר, לאיכות ההדפסה, לעיכובים במשלוח, או לנזקים שייגרמו לספר במהלך המשלוח. כל עסקה מתבצעת ישירות מול הסופר המוכר.
              </p>
              <p>
                במידה וקיימת בעיה בהזמנה, אנו מספקים פלטפורמה ליצירת קשר ישיר עם הסופר לצורך קבלת שירות לקוחות. אנו שומרים לעצמנו את הזכות להשעות או להסיר סופרים שלא יעמדו בסטנדרט שירות ראוי, אך כאמור - העסקה המשפטית היא בינך לבין הסופר בלבד.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="text-green-600" /> רכישות, תשלומים וביטולים
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                התשלום באתר מתבצע בצורה מאובטחת באמצעות ספק סליקה חיצוני (PayPlus / Stripe). פרטי האשראי שלכם אינם נשמרים בשרתי האתר בשום שלב.
              </p>
              <p>
                בעת הרכישה, התשלום מפוצל כך ש-90% מסכום הספר בתוספת מלוא דמי המשלוח מועברים מיידית לחשבון הבנק של הסופר, ו-10% נשמרים כעמלת פלטפורמה בגין השימוש והסליקה.
              </p>
              <p>
                <strong>ביטול עסקה:</strong> על פי חוק הגנת הצרכן, ניתן לבטל עסקה בתוך 14 ימים מיום קבלת המוצר, ובלבד שהמוצר יוחזר לסופר באריזתו המקורית ומבלי שנעשה בו שימוש. דמי המשלוח חזרה יחולו על הקונה. בקשת ביטול תיעשה באמצעות יצירת קשר עם שירות הלקוחות שלנו.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="text-green-600" /> מדיניות פרטיות
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                אנו מכבדים את פרטיותכם ומחויבים להגן עליה. המידע שתספקו לנו (שם, כתובת, אימייל, טלפון) ישמש אך ורק לצורך השלמת ההזמנה ויימסר אך ורק לסופר ממנו רכשתם את הספר ולחברת המשלוחים, לצורך שילוח החבילה בלבד.
              </p>
              <p>
                אנו לא נעביר, נמכור או נשכיר את פרטיכם לצדדים שלישיים לצרכי שיווק ללא הסכמתכם המפורשת.
              </p>
              <p>
                האתר משתמש בעוגיות (Cookies) על מנת לשפר את חווית המשתמש, לשמור את עגלת הקניות שלכם, ולנתח תנועה באתר (באמצעות כלים כמו Google Analytics). באפשרותכם לחסום שימוש בעוגיות דרך הגדרות הדפדפן שלכם.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="text-green-600" /> קניין רוחני (זכויות יוצרים)
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                כל זכויות היוצרים על הספרים, תמונות הכריכה והטקסטים השייכים לספרים הינם בבעלותם הבלעדית של הסופרים שהעלו אותם. העלאת תוכן לאתר מהווה הצהרה של הסופר כי הוא בעל הזכויות החוקיות בתוכן.
              </p>
              <p>
                עיצוב האתר, הקוד, הלוגו והתוכן הכללי השייך ל-BookToTable הינם קניינה הרוחני של החברה ואין להעתיק, לשכפל או להשתמש בהם ללא אישור בכתב.
              </p>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
