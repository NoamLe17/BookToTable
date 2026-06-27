'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen,
  Package,
  CreditCard,
  Truck,
  Users,
  Star,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Percent,
  Wallet,
  Settings,
  Plus,
  MapPin,
} from 'lucide-react';

interface StepProps {
  number: number;
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}

function Step({ number, icon: Icon, title, color, children }: StepProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${color}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-6 text-right"
      >
        <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center shrink-0 shadow-sm">
          <Icon size={22} />
        </div>
        <div className="flex-1 text-right">
          <span className="text-xs font-bold opacity-60 block mb-0.5">שלב {number}</span>
          <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
        </div>
        <div className="shrink-0">
          {open ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </button>
      {open && (
        <div className="px-6 pb-6 pt-0">
          <div className="border-t border-white/50 pt-5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ icon: Icon, title, children, variant = 'blue' }: {
  icon?: React.ElementType;
  title?: string;
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'orange' | 'red';
}) {
  const variants = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div className={`border rounded-xl p-4 ${variants[variant]} mt-4`}>
      {title && (
        <p className="font-bold flex items-center gap-2 mb-1">
          {Icon && <Icon size={16} />} {title}
        </p>
      )}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export default function AuthorGuidePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">גישה מוגבלת</h2>
        <p className="text-gray-500 mb-6">עמוד זה זמין לסופרים רשומים בלבד.</p>
        <Link href="/auth" className="bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors">
          התחברות / הרשמה
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full text-sm font-bold mb-4">
          <Star size={16} />
          מדריך לסופרים — ברוכים הבאים ל-BookToTable
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-3">
          איך עובד BookToTable? 📚
        </h1>
        <p className="text-gray-500 font-medium max-w-2xl leading-relaxed">
          כל מה שצריך לדעת כדי למכור ספרים דרך הפלטפורמה שלנו — מהרשמה ועד קבלת כסף, צעד אחר צעד.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'הוסף ספר', href: '/dashboard/books/new', icon: Plus },
          { label: 'עריכת פרופיל', href: '/dashboard/profile', icon: Settings },
          { label: 'ההזמנות שלי', href: '/dashboard#orders', icon: Package },
          { label: 'צפה בחנות', href: '/', icon: ExternalLink },
        ].map(item => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all group"
          >
            <div className="w-10 h-10 bg-green-50 group-hover:bg-green-100 rounded-full flex items-center justify-center text-green-600 transition-colors">
              <item.icon size={18} />
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-green-700 transition-colors">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-4">

        {/* Step 1: Registration */}
        <Step number={1} icon={Users} title="הרשמה ויצירת פרופיל" color="border-purple-200 bg-purple-50/60">
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              הכל מתחיל מ<strong>יצירת חשבון</strong> בפלטפורמה. אם אתה קורא את המדריך הזה — כבר עשית זאת! 🎉
            </p>
            <p>
              לאחר ההרשמה, כדאי מאוד להשלים את הפרופיל שלך: תמונה, ביוגרפיה קצרה, וגיל. פרטים אלו יופיעו ברשימת הסופרים ויעזרו לקוראים לחבר אליך.
            </p>
            <InfoBox icon={Info} title="מה מופיע בפרופיל הציבורי שלך?" variant="blue">
              שמך, תמונתך, ביוגרפיה קצרה, והספרים שפרסמת. קוראים יוכלו להיכנס לפרופיל שלך ולעיין בכל ספריך.
            </InfoBox>
            <div className="mt-4">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                <Settings size={16} />
                השלם את הפרופיל שלך
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </Step>

        {/* Step 2: Add Book */}
        <Step number={2} icon={BookOpen} title="הוספת ספר לחנות" color="border-blue-200 bg-blue-50/60">
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              לחץ על <strong>"הוסף ספר חדש"</strong> בלוח הבקרה כדי להעלות את הספר הראשון שלך.
            </p>
            <p>פרטים הנדרשים בעת הוספת ספר:</p>
            <ul className="list-none space-y-2">
              {[
                ['כותרת הספר', 'שם הספר כפי שיוצג לקוראים'],
                ['תיאור / תקציר', 'סיפור קצר על הספר שיניע קוראים לרכוש'],
                ['מחיר (₪)', 'אתה קובע את המחיר — אין כמעט מגבלה'],
                ['משקל (גרמים)', 'משמש לחישוב עלויות משלוח מדויקות'],
                ["ז'אנר", 'מאפשר לקוראים לחפש לפי קטגוריה'],
                ['תמונת כריכה', 'חובה! תמונה איכותית מגדילה מכירות משמעותית'],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>{title}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
            <InfoBox icon={Info} title="פרסום מיידי" variant="green">
              כרגע, ברגע שאתה לוחץ &quot;פרסם ספר בחנות&quot; — הספר מופיע מיד לכלל הקוראים. בהמשך נוסיף אפשרות לשמור כ&quot;טיוטה&quot;.
            </InfoBox>
            <div className="mt-4">
              <Link
                href="/dashboard/books/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                <Plus size={16} />
                הוסף ספר עכשיו
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </Step>

        {/* Step 3: Shipping */}
        <Step number={3} icon={Truck} title="הגדרת אופן המשלוח" color="border-green-200 bg-green-50/60">
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              אחד הדברים החשובים ביותר — <strong>איך הספר יגיע לקורא?</strong> אתה מגדיר זאת בעמוד הפרופיל שלך.
            </p>
            <p>ישנן שלוש אפשרויות שניתן להפעיל (ניתן לסמן יותר מאחת):</p>
            <ul className="space-y-3 mt-2">
              <li className="bg-white border border-green-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-1">
                  <Truck size={18} className="text-green-600" />
                  <strong>משלוח עד הבית</strong>
                </div>
                <p className="text-gray-600 text-xs">
                  אתה אורז את הספר ושולח אותו בדואר או בשליח לכתובת שהקורא מזין.
                  עלות המשלוח — <strong>חינם עד 40 ק"מ</strong> ותוספת של 15₪ מעל 40 ק"מ.
                </p>
              </li>
              <li className="bg-white border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-1">
                  <MapPin size={18} className="text-blue-600" />
                  <strong>נקודת חלוקה</strong>
                </div>
                <p className="text-gray-600 text-xs">
                  הקורא בוחר לוקר / נקודת איסוף קרובה אליו. <span className="font-bold text-orange-600">שירות זה בפיתוח — יהיה זמין בקרוב!</span>
                </p>
              </li>
              <li className="bg-white border border-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-1">
                  <Users size={18} className="text-purple-600" />
                  <strong>איסוף עצמי</strong>
                </div>
                <p className="text-gray-600 text-xs">
                  הקורא מגיע ישירות אליך ומוצגים לו פרטי הכתובת שהזנת. הקורא מקבל <strong>הנחה של 10%</strong> על הרכישה.
                  כדי להפעיל זאת, יש להזין כתובת איסוף בפרופיל.
                </p>
              </li>
            </ul>
            <InfoBox icon={AlertCircle} title="שלב זה חשוב!" variant="orange">
              <strong>אם לא תגדיר אף אפשרות משלוח</strong> — הקורא לא יוכל לבצע הזמנה! וודא שסימנת לפחות אפשרות אחת.
            </InfoBox>
            <div className="mt-4">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                <Settings size={16} />
                הגדר אפשרויות משלוח
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </Step>

        {/* Step 4: Payment */}
        <Step number={4} icon={CreditCard} title="הגדרת אמצעי תשלום" color="border-yellow-200 bg-yellow-50/60">
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              כאשר קורא משלים הזמנה, הוא מועבר לתשלום <strong>ישיר אליך</strong>. לכן חובה להגדיר לפחות אמצעי תשלום אחד.
            </p>
            <p>האפשרויות הזמינות:</p>
            <ul className="space-y-2">
              {[
                ['Bit', 'הוסף את מספר הטלפון שלך — הקורא ישלח ישירות ל-Bit שלך'],
                ['Paybox', 'הדבק קישור לקופה שלך — מתאים גם לעסקים פרטיים ללא עוסק'],
                ['סליקת אשראי', 'קישור לדף תשלום של PayPlus / משולם / אשורית וכו׳'],
                ['העברה בנקאית', 'שם בנק, סניף, חשבון — הקורא יראה זאת ויעביר ידנית'],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                  <span><strong>{name}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
            <InfoBox icon={AlertCircle} title="חשוב מאוד" variant="red">
              <strong>באחריותך לוודא</strong> שהתשלום אכן נכנס לחשבונך <strong>לפני</strong> שאתה אורז ושולח את הספר. הפלטפורמה אינה מתווכת בתשלומים בשלב זה.
            </InfoBox>
            <div className="mt-4">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                <CreditCard size={16} />
                הגדר אמצעי תשלום
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </Step>

        {/* Step 5: Order arrives */}
        <Step number={5} icon={Package} title="הגיעה הזמנה — מה עכשיו?" color="border-orange-200 bg-orange-50/60">
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              כאשר קורא מזמין את ספרך, ההזמנה מופיעה ב<strong>לוח הבקרה שלך</strong> תחת &quot;טבלת הזמנות&quot;.
            </p>
            <ol className="list-none space-y-3">
              {[
                ['1', 'ודא שהתשלום הגיע', 'בדוק ב-Bit / Paybox / העו"ש שלך שהכסף נכנס'],
                ['2', 'ארוז את הספר', 'בצורה מסודרת ובטוחה כדי שלא ייפגע בדרך'],
                ['3', 'שלח עם שליח / דואר', 'קבל מספר מעקב מחברת השליחות'],
                ['4', 'סמן כ"נשלח"', 'הזן את מספר המעקב בלוח הבקרה — הקורא יקבל מייל עדכון'],
                ['5', 'סמן כ"הושלם"', 'לאחר שהקורא קיבל את הספר'],
              ].map(([num, title, desc]) => (
                <li key={num} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    {num}
                  </div>
                  <div>
                    <strong>{title}</strong>
                    <p className="text-gray-500">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <Link
                href="/dashboard#orders"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                <Package size={16} />
                צפה בהזמנות
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </Step>

        {/* Step 6: Economics */}
        <Step number={6} icon={Percent} title="מה יוצא לי מזה? ומה לאתר?" color="border-teal-200 bg-teal-50/60">
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              המודל הכלכלי של BookToTable <strong>שקוף לחלוטין</strong>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="bg-white rounded-xl border border-green-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet size={20} className="text-green-600" />
                  <h4 className="font-extrabold text-green-800">מה יוצא לסופר</h4>
                </div>
                <ul className="space-y-2 text-xs text-gray-700">
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" /><span><strong>100% ממחיר הספר</strong> — כל הסכום הולך ישירות אליך, ללא עמלת תיווך!</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" /><span>חשיפה לקהל קוראים שמחפשים ספרים עבריים עצמאיים</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" /><span>ניהול הזמנות, מעקב ותקשורת עם קוראים במקום אחד</span></li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-blue-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={20} className="text-blue-600" />
                  <h4 className="font-extrabold text-blue-800">מה יוצא לאתר</h4>
                </div>
                <ul className="space-y-2 text-xs text-gray-700">
                  <li className="flex items-start gap-2"><Info size={14} className="text-blue-400 mt-0.5 shrink-0" /><span>כרגע <strong>אנחנו לא גובים עמלה</strong> — זוהי תקופת השקה</span></li>
                  <li className="flex items-start gap-2"><Info size={14} className="text-blue-400 mt-0.5 shrink-0" /><span>בעתיד, ייתכן עמלה קטנה על עסקאות לצורך תחזוקת הפלטפורמה</span></li>
                  <li className="flex items-start gap-2"><Info size={14} className="text-blue-400 mt-0.5 shrink-0" /><span>כל שינוי במודל יפורסם מראש לכלל הסופרים</span></li>
                </ul>
              </div>
            </div>
          </div>
        </Step>

        {/* Step 7: Future roadmap */}
        <Step number={7} icon={Star} title="מה בדרך? (רודמאפ)" color="border-pink-200 bg-pink-50/60">
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>BookToTable נמצאת בתחילת הדרך ומתפתחת בקצב מהיר. הנה מה שיגיע בקרוב:</p>
            <ul className="space-y-3 mt-2">
              {[
                { title: 'חיבור לחברת משלוחים', desc: 'אוטומציה מלאה של הדפסת שוברים ומעקב, ללא צורך בשליח עצמאי', soon: true },
                { title: 'נקודות חלוקה', desc: 'לוקרים ונקודות איסוף בכל רחבי הארץ — קוראים יוכלו לבחור נקודה קרובה', soon: true },
                { title: 'סליקה פנימית', desc: 'תשלום ישיר באשראי דרך הפלטפורמה, עם העברה אוטומטית לחשבונך', soon: false },
                { title: 'ביקורות ודירוגים', desc: 'קוראים יוכלו להשאיר ביקורות על ספרים', soon: false },
                { title: 'אנליטיקס מתקדמים', desc: 'ניתוח מכירות, קהל יעד וביצועים', soon: false },
              ].map(item => (
                <li key={item.title} className="flex items-start gap-3 bg-white rounded-xl border border-pink-100 p-4">
                  <div className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 mt-0.5 ${item.soon ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.soon ? 'בקרוב' : 'עתיד'}
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <InfoBox variant="blue">
              <p>🙏 אנחנו מתנצלים על כל אי-נוחות בשלב הנוכחי. הפלטפורמה בתחילתה ואנחנו עובדים קשה כדי להביא לכם את הכלים הטובים ביותר. תודה על האמון!</p>
            </InfoBox>
          </div>
        </Step>

      </div>

      {/* Bottom CTA */}
      <div className="mt-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
        <h3 className="text-2xl font-black mb-2">מוכן להתחיל?</h3>
        <p className="text-green-100 mb-6">הוסף את הספר הראשון שלך והתחל למכור עוד היום.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/books/new"
            className="bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors inline-flex items-center gap-2 justify-center"
          >
            <Plus size={18} />
            הוסף ספר ראשון
          </Link>
          <Link
            href="/dashboard/profile"
            className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2 justify-center border border-green-400"
          >
            <Settings size={18} />
            הגדר פרופיל ומשלוח
          </Link>
        </div>
      </div>
    </div>
  );
}
