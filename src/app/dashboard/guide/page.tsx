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
  Wallet,
  Settings,
  Plus,
  MapPin,
  Mail,
  Phone,
  Building2,
  Landmark,
  Rocket,
  Heart,
  TrendingUp,
  UserCircle,
} from 'lucide-react';

// ─── Shared sub-components ───────────────────────────────────────────────────

function SectionHeader({
  chapter,
  icon: Icon,
  title,
  subtitle,
  color,
}: {
  chapter: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className={`rounded-2xl p-6 sm:p-8 mb-2 ${color}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
          <Icon size={22} />
        </div>
        <span className="text-xs sm:text-sm font-bold opacity-70 uppercase tracking-wider">{chapter}</span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 text-base sm:text-lg leading-relaxed">{subtitle}</p>
    </div>
  );
}

function AccordionItem({
  icon: Icon,
  iconColor,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 sm:p-6 text-right hover:bg-gray-50 transition-colors"
      >
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
          <Icon size={20} />
        </div>
        <span className="flex-1 text-right font-bold text-gray-900 text-base sm:text-lg">{title}</span>
        <div className="shrink-0 text-gray-400">
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-6 pt-1">
          <div className="border-t border-gray-100 pt-5 space-y-4 text-gray-700 text-base leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function Callout({
  variant = 'blue',
  icon: Icon,
  title,
  children,
}: {
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  icon?: React.ElementType;
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    blue: 'bg-blue-50   border-blue-200   text-blue-900',
    green: 'bg-green-50  border-green-200  text-green-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50    border-red-200    text-red-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
  };
  return (
    <div className={`border rounded-xl p-4 sm:p-5 ${styles[variant]}`}>
      {(title || Icon) && (
        <p className="font-bold flex items-center gap-2 mb-2 text-base">
          {Icon && <Icon size={17} className="shrink-0" />}
          {title}
        </p>
      )}
      <div className="text-sm sm:text-base leading-relaxed space-y-1">{children}</div>
    </div>
  );
}

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 size={17} className="text-green-500 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function CardRow({ icon: Icon, iconBg, title, children }: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={17} />
        </div>
        <strong className="text-gray-900 text-base">{title}</strong>
      </div>
      <div className="text-sm sm:text-base text-gray-600 leading-relaxed pr-12">{children}</div>
    </div>
  );
}

function StepBadge({ n, label, desc }: { n: string; label: string; desc: string }) {
  return (
    <li className="flex items-start gap-4">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <p className="font-bold text-gray-900">{label}</p>
        <p className="text-sm sm:text-base text-gray-500 mt-0.5">{desc}</p>
      </div>
    </li>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AuthorGuidePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <AlertCircle size={52} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">גישה מוגבלת</h2>
        <p className="text-gray-500 mb-6 text-lg">עמוד זה זמין לסופרים רשומים בלבד.</p>
        <Link
          href="/auth"
          className="bg-green-600 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-green-700 transition-colors text-base"
        >
          התחברות / הרשמה
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-3xl mx-auto">

      {/* ── Hero ── */}
      <div className="mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 px-4 py-2 rounded-full text-sm font-bold mb-5">
          <Star size={15} />
          מדריך מלא לסופרים
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
          ברוך הבא ל-BookToTable! 📚
        </h1>
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xl">
          הפלטפורמה שמאפשרת לסופרים עצמאיים למכור את ספריהם ישירות לקוראים — בלי מתווכים, בלי עמלות, ובלי בירוקרטיה מיותרת.
        </p>
      </div>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        {[
          { label: 'הוסף ספר', href: '/dashboard/books/new', icon: Plus, bg: 'bg-blue-50 text-blue-600' },
          { label: 'עריכת פרופיל', href: '/dashboard/profile', icon: Settings, bg: 'bg-purple-50 text-purple-600' },
          { label: 'ההזמנות שלי', href: '/dashboard#orders', icon: Package, bg: 'bg-orange-50 text-orange-600' },
          { label: 'כניסה לחנות', href: '/', icon: ExternalLink, bg: 'bg-green-50 text-green-600' },
        ].map(item => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white border border-gray-200 hover:border-green-400 hover:shadow-sm rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${item.bg}`}>
              <item.icon size={18} />
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-green-700 transition-colors leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          CHAPTER 1 — יצירת פרופיל
      ══════════════════════════════════════════ */}
      <SectionHeader
        chapter="פרק א׳"
        icon={UserCircle}
        title="יצירת פרופיל"
        subtitle="הכל מתחיל מפרופיל מוכן ומוגדר. ככה הקוראים יכירו אותך — וככה תוכל לקבל כסף ולשלוח ספרים."
        color="bg-purple-50 border-2 border-purple-100"
      />

      <div className="space-y-3 mb-10">

        <AccordionItem
          icon={UserCircle}
          iconColor="bg-purple-100 text-purple-600"
          title="הפרופיל הציבורי שלך"
          defaultOpen={true}
        >
          <p>
            לאחר ההרשמה לאתר, כדאי מאוד להשלים את הפרופיל שלך — זה מה שיציג אותך בפני הקוראים.
          </p>
          <ul className="space-y-2">
            <CheckRow><strong>תמונת פרופיל</strong> — תמונה מקצועית או אישית שתזהה אותך</CheckRow>
            <CheckRow><strong>ביוגרפיה</strong> — כמה מילים על עצמך, מאיפה הכתיבה מגיעה, מה מניע אותך</CheckRow>
            <CheckRow><strong>גיל</strong> — מופיע בפרופיל הציבורי שלך (אופציונלי)</CheckRow>
          </ul>
          <Callout variant="blue" icon={Info} title="למה הפרופיל חשוב?">
            קוראים שמגיעים לדף ספר שלך יראו גם את הפרופיל שלך. סופר עם פרופיל מלא ותמונה מוכר יותר בממוצע ב-40% — זה לא סוד.
          </Callout>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors mt-2"
          >
            <Settings size={16} />
            עריכת פרופיל
            <ArrowLeft size={16} />
          </Link>
        </AccordionItem>

        <AccordionItem
          icon={CreditCard}
          iconColor="bg-yellow-100 text-yellow-600"
          title="הגדרת אמצעי תשלום — איך תרוויח כסף"
          defaultOpen={true}
        >
          <p>
            כעת בשלב ההרצה, כאשר קורא מזמין ספר הוא מועבר לשלם <strong>ישירות אליך</strong> — ולא דרך הפלטפורמה.
            שימוש בקופת Paybox ואמצעי תשלום חלופיים הוא פתרון זמני עד שתהיה סליקה אוטומטית מלאה באתר.
            לכן, חובה להגדיר לפחות אמצעי תשלום אחד על מנת שיהיה לקוראים לאן להעביר את התשלום.
          </p>

          <div className="space-y-3">
            <CardRow icon={Phone} iconBg="bg-blue-100 text-blue-600" title="Bit — הכי פשוט">
              מזינים את מספר הטלפון שלך. הקורא פותח Bit ושולח את הסכום. מתאים לכולם — לא צריך עסק רשום.
            </CardRow>

            <CardRow icon={Wallet} iconBg="bg-indigo-100 text-indigo-600" title="Paybox — מומלץ לסופרים פרטיים">
              Paybox מאפשרים לפתוח &quot;קופה&quot; בחינם, גם ללא עוסק פטור / מורשה. אחרי שפתחתם קופה, תדביקו את הקישור הקבוע אליה כאן — וכל קורא שמשלים הזמנה יגיע ישירות לדף התשלום שלכם.
              <br /><br />
              <strong>איך פותחים קופה?</strong> היכנסו ל-payboxapp.com, צרו קופה ב&quot;הגדרות → שיתוף קופה&quot;, ותגדירו אותה כ&quot;אישית&quot;.
            </CardRow>

            <CardRow icon={Building2} iconBg="bg-green-100 text-green-600" title="סליקת אשראי — לבעלי עסק רשום">
              אם יש לכם עוסק פטור / מורשה, תוכלו לפתוח חשבון ב-PayPlus, משולם, אשורית, או כל חברת סליקה אחרת — ולהדביק כאן קישור קבוע לדף התשלום שלכם. הקורא ישלם בכרטיס אשראי וכסף יגיע ישירות אליכם.
            </CardRow>

            <CardRow icon={Landmark} iconBg="bg-gray-100 text-gray-600" title="העברה בנקאית — לא ממש מומלץ">
              מזינים פרטי חשבון בנק. הקורא יצטרך להעביר ידנית — מה שמאיט את התהליך ומגדיל את הסיכוי שהוא יוותר. משמש בעיקר כגיבוי.
            </CardRow>
          </div>

          <Callout variant="red" icon={AlertCircle} title="אחריות הסופר לוודא תשלום">
            לפני שאתם אורזים ושולחים ספר — <strong>ודאו שהכסף אכן הגיע</strong> לחשבונכם. הפלטפורמה אינה מתווכת בתשלומים ואינה אחראית על גביה.
          </Callout>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors mt-2"
          >
            <CreditCard size={16} />
            הגדר אמצעי תשלום
            <ArrowLeft size={16} />
          </Link>
        </AccordionItem>

        <AccordionItem
          icon={Truck}
          iconColor="bg-green-100 text-green-600"
          title="הגדרת אפשרויות משלוח"
          defaultOpen={true}
        >
          <p>
            אתה מגדיר <strong>אילו אפשרויות משלוח יוצגו לקורא</strong> בעת ביצוע הזמנה.
            ניתן לסמן יותר מאפשרות אחת.
          </p>

          <div className="space-y-3">
            <CardRow icon={Truck} iconBg="bg-green-100 text-green-600" title="משלוח עד הבית">
              הקורא מזין כתובת בית ואתה שולח אליו. <strong>הסופר קובע את עלות המשלוח</strong> כחלק מהמחיר הסופי שהקורא ישלם בקופה. בסעיף השילוח מטה נסביר איך בדיוק לשלוח.
            </CardRow>

            <CardRow icon={MapPin} iconBg="bg-blue-100 text-blue-600" title="נקודת חלוקה / לוקר">
              <span className="text-orange-600 font-bold">בפיתוח — יופעל בקרוב.</span> הקורא יבחר נקודת איסוף קרובה אליו ואתה שולח לשם.
            </CardRow>

            <CardRow icon={Users} iconBg="bg-purple-100 text-purple-600" title="איסוף עצמי מהסופר">
              הקורא מגיע אליך פיזית. יוצג לו הכתובת שתזין. הוא מקבל <strong>הנחה של 10%</strong> על הרכישה. מחייב הזנת כתובת איסוף בפרופיל.
            </CardRow>
          </div>

          <Callout variant="orange" icon={AlertCircle} title="חשוב: חובה לסמן לפחות אחת!">
            אם לא תגדיר אף אפשרות משלוח — הקורא לא יוכל לבצע הזמנה.
          </Callout>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors mt-2"
          >
            <Settings size={16} />
            הגדר אפשרויות משלוח
            <ArrowLeft size={16} />
          </Link>
        </AccordionItem>

      </div>

      {/* ══════════════════════════════════════════
          CHAPTER 2 — מכירת ספרים
      ══════════════════════════════════════════ */}
      <SectionHeader
        chapter="פרק ב׳"
        icon={BookOpen}
        title="מכירת ספרים"
        subtitle="הוספת ספר לחנות, ניהול הזמנות, ואיך בדיוק לשלוח לקוראים שלך."
        color="bg-blue-50 border-2 border-blue-100"
      />

      <div className="space-y-3 mb-10">

        <AccordionItem
          icon={Plus}
          iconColor="bg-blue-100 text-blue-600"
          title="הוספת ספר לחנות"
          defaultOpen={true}
        >
          <p>
            לחצו על <strong>&quot;הוסף ספר חדש&quot;</strong> בלוח הבקרה. תתבקשו למלא:
          </p>
          <ul className="space-y-2">
            <CheckRow><strong>כותרת הספר</strong> — כפי שיופיע לקוראים</CheckRow>
            <CheckRow><strong>תיאור / תקציר</strong> — מה הספר עוסק בו ומה מייחד אותו. ככל שהתיאור עשיר יותר, כך ייטב.</CheckRow>
            <CheckRow><strong>מחיר (₪)</strong> — אתה קובע לגמרי. אין מגבלה מלמעלה.</CheckRow>
            <CheckRow><strong>ז׳אנר</strong> — מאפשר לקוראים לסנן לפי קטגוריה.</CheckRow>
            <CheckRow><strong>תמונת כריכה</strong> — <strong>חובה!</strong> כריכה איכותית היא אחד הגורמים הכי משפיעים על מכירות.</CheckRow>
          </ul>
          <Callout variant="green" icon={Info} title="פרסום מיידי">
            ברגע שלוחצים &quot;פרסם ספר&quot; — הספר מופיע מיידית בחנות לכלל הקוראים. בהמשך תהיה אפשרות שמירה כטיוטה.
          </Callout>
          <Link
            href="/dashboard/books/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors mt-2"
          >
            <Plus size={16} />
            הוסף ספר עכשיו
            <ArrowLeft size={16} />
          </Link>
        </AccordionItem>

        <AccordionItem
          icon={Package}
          iconColor="bg-orange-100 text-orange-600"
          title="ניהול הזמנה — מה עושים כשנכנסת הזמנה"
          defaultOpen={true}
        >
          <p>
            כאשר קורא מזמין ספר, ההזמנה מופיעה בלוח הבקרה תחת <strong>&quot;טבלת הזמנות&quot;</strong> עם כל פרטי הקורא.
          </p>
          <ol className="space-y-4">
            <StepBadge n="1" label="בדקו שהתשלום הגיע" desc="פתחו Bit / Paybox / העו&quot;ש שלכם וודאו שהכסף נכנס לפני כל פעולה." />
            <StepBadge n="2" label="ארזו את הספר" desc="שימו את הספר בניילון בועות או נייר פצפצים, ואז בקרטון. ספר שמגיע פגום — לא מרגש אף אחד." />
            <StepBadge n="3" label="שלחו ורשמו מספר מעקב" desc="קבלו מספר מעקב מחברת השליחות / הדואר (פירוט בסעיף הבא)." />
            <StepBadge n="4" label="סמנו כ-&quot;נשלח&quot; בלוח הבקרה" desc="הזינו את מספר המעקב — הקורא יקבל מייל אוטומטי עם פרטי המעקב." />
            <StepBadge n="5" label="סמנו כ-&quot;הושלם&quot;" desc="לאחר שהקורא אישר קבלה, עדכנו את הסטטוס להשלמה." />
          </ol>
          <Callout variant="blue" icon={Info}>
            ניתן לכתוב <strong>הערה לסופר</strong> על ידי הקורא בהזמנה (לדוגמה: &quot;אנא הקדש לי&quot;). תמיד עברו על ההערות לפני האריזה.
          </Callout>
          <Link
            href="/dashboard#orders"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors mt-2"
          >
            <Package size={16} />
            צפה בהזמנות שלי
            <ArrowLeft size={16} />
          </Link>
        </AccordionItem>

        <AccordionItem
          icon={Truck}
          iconColor="bg-teal-100 text-teal-600"
          title="שילוח — איך שולחים ספר לקורא?"
          defaultOpen={true}
        >
          <p>
            כרגע, השילוח מתבצע <strong>ישירות על ידכם</strong>. הנה האפשרויות העיקריות:
          </p>

          <div className="space-y-3">
            <CardRow icon={Mail} iconBg="bg-yellow-100 text-yellow-600" title="דואר ישראל — הזול ביותר">
              מגיעים לסניף דואר קרוב, שוקלים את החבילה, ושולחים. ניתן לשלוח עם מספר מעקב (רשום) תמורת כ-15–25 ₪ לחבילה עד 1 ק&quot;ג. זמן אספקה: 2–5 ימי עסקים.
              <br /><br />
              <strong>טיפ:</strong> בקשו &quot;משלוח רשום&quot; — יש לו מספר מעקב שניתן להזין בלוח הבקרה.
            </CardRow>

            <CardRow icon={Truck} iconBg="bg-blue-100 text-blue-600" title="חברת שליחויות — מהיר ובטוח">
              חברות כמו טי-פי-טי (TNT), חייטא (Cheetah), HFD ואחרות מציעות משלוח יום-עסקים הבא תמורת 25–45 ₪. הן מגיעות לאסוף מהבית — אין צורך לצאת. ניתן לפתוח חשבון לקוח חינם ולהזמין איסוף אונליין.
            </CardRow>

            <CardRow icon={Users} iconBg="bg-purple-100 text-purple-600" title="משלוח עצמי / מסירה ביד">
              אם הקורא נמצא באזור שלכם — ניתן להסכים על מסירה ידנית. הקורא צריך לבחור &quot;איסוף עצמי&quot; בהזמנה, ואז תתאמו ביניכם. <strong>הנחה של 10%</strong> ניתנת אוטומטית לקוראים שבחרו איסוף עצמי.
            </CardRow>
          </div>

          <Callout variant="orange" icon={Rocket} title="בקרוב — חיבור לחברת שליחויות">
            אנחנו עובדים על אינטגרציה עם חברת שליחויות שתאפשר: הזמנת שליח בלחיצה, הדפסת שובר, ומעקב אוטומטי — ישירות מלוח הבקרה. זמני שילוח קצרים יותר, פחות טרחה מצד הסופר.
          </Callout>
        </AccordionItem>

      </div>

      {/* ══════════════════════════════════════════
          CHAPTER 3 — נושאים כלליים
      ══════════════════════════════════════════ */}
      <SectionHeader
        chapter="פרק ג׳"
        icon={Star}
        title="שקיפות ויתרונות"
        subtitle="מה יוצא לך מהפלטפורמה, מה אנחנו מרוויחים, ולאן אנחנו הולכים."
        color="bg-teal-50 border-2 border-teal-100"
      />

      <div className="space-y-3 mb-10">

        <AccordionItem
          icon={Heart}
          iconColor="bg-rose-100 text-rose-600"
          title="מה יוצא לסופר מהפלטפורמה?"
          defaultOpen={true}
        >
          <ul className="space-y-3">
            <CheckRow>
              <strong>100% ממחיר הספר הולך אליך</strong> — אין עמלת תיווך, אין דמי ניהול, אין הפתעות.
            </CheckRow>
            <CheckRow>
              <strong>חשיפה לקהל קוראים</strong> שמחפשים ספרים ישראלים עצמאיים — קהל שאינו נמצא בהכרח באמזון, סטימצקי או Kindle.
            </CheckRow>
            <CheckRow>
              <strong>ניהול הזמנות</strong> מסודר: פרטי קורא, כתובת, הערות — הכל במקום אחד.
            </CheckRow>
            <CheckRow>
              <strong>מייל אוטומטי לקורא</strong> עם פרטי מעקב כשאתה מסמן שנשלח — ללא עבודה ידנית מצד הסופר.
            </CheckRow>
            <CheckRow>
              <strong>הגמישות בידיך:</strong> אתה קובע מחיר, שיטות משלוח, אמצעי תשלום.
            </CheckRow>
          </ul>
        </AccordionItem>

        <AccordionItem
          icon={TrendingUp}
          iconColor="bg-blue-100 text-blue-600"
          title="מה האתר מרוויח מזה?"
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="font-bold text-green-800 mb-1">כרגע — חינם לחלוטין</p>
              <p className="text-sm text-green-700">כעת הפלטפורמה חינמית לחלוטין. אנחנו בונים את הקהילה ורוצים שסופרים יצטרפו ולכן לא גובים עמלה.</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="font-bold text-blue-800 mb-1">בעתיד — תהיה עמלה</p>
              <p className="text-sm text-blue-700">בעתיד תיגבה עמלה על כל עסקה על מנת לתחזק שרתים, לפתח ולשווק את האתר. כל שינוי כמובן יפורסם מראש.</p>
            </div>
          </div>
          <Callout variant="blue">
            <strong>ההבטחה שלנו:</strong> לא נשנה את מודל התשלום מבלי להודיע לפחות 30 יום מראש.
          </Callout>
        </AccordionItem>

        <AccordionItem
          icon={Rocket}
          iconColor="bg-pink-100 text-pink-600"
          title="לאן אנחנו הולכים — החזון"
          defaultOpen={true}
        >
          <p>
            BookToTable בתחילת הדרך, אך יש לנו תוכנית ברורה:
          </p>
          <ul className="space-y-3">
            {[
              { label: 'חיבור לחברת שליחויות', desc: 'הזמנת שליח בלחיצה, הדפסת שובר אוטומטי ומעקב ישיר מהדשבורד — ללא יציאה מהאתר.', tag: 'בקרוב', tagColor: 'bg-green-100 text-green-700' },
              { label: 'נקודות חלוקה ולוקרים', desc: 'הקורא יבחר נקודת איסוף מרשת ארצית. פחות טרחה לכולם.', tag: 'בקרוב', tagColor: 'bg-green-100 text-green-700' },
              { label: 'סליקה פנימית', desc: 'תשלום מאוחד באשראי דרך הפלטפורמה עם העברה אוטומטית לסופר — ללא צורך בחשבון Paybox נפרד.', tag: 'עתידי', tagColor: 'bg-gray-100 text-gray-600' },
              { label: 'ביקורות ודירוגי קוראים', desc: 'קוראים שקיבלו ספר יוכלו לכתוב ביקורת שתופיע בדף הספר.', tag: 'עתידי', tagColor: 'bg-gray-100 text-gray-600' },
              { label: 'אנליטיקס מתקדמים', desc: 'גרפים של מכירות לאורך זמן, פילוח גיאוגרפי של קוראים ועוד.', tag: 'עתידי', tagColor: 'bg-gray-100 text-gray-600' },
            ].map(item => (
              <li key={item.label} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 mt-0.5 ${item.tagColor}`}>
                  {item.tag}
                </span>
                <div>
                  <p className="font-bold text-gray-900">{item.label}</p>
                  <p className="text-sm sm:text-base text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <Callout variant="purple">
            🙏 אנחנו מתנצלים על כל אי-נוחות בשלב הנוכחי. אנחנו עובדים קשה כדי להביא לכם כלים טובים יותר — תודה על האמון והסבלנות!
          </Callout>
        </AccordionItem>

      </div>

      {/* ── Bottom CTA ── */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 sm:p-10 text-white text-center">
        <div className="text-4xl mb-3">🚀</div>
        <h3 className="text-2xl sm:text-3xl font-black mb-3">מוכן להתחיל?</h3>
        <p className="text-green-100 mb-7 text-base sm:text-lg max-w-sm mx-auto">
          כל מה שצריך זה פרופיל מוגדר וספר מועלה — והמכירות יכולות להתחיל.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/books/new"
            className="bg-white text-green-700 font-bold px-7 py-3.5 rounded-xl hover:bg-green-50 transition-colors inline-flex items-center gap-2 justify-center text-base"
          >
            <Plus size={18} />
            הוסף ספר ראשון
          </Link>
          <Link
            href="/dashboard/profile"
            className="bg-green-500 hover:bg-green-400 text-white font-bold px-7 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2 justify-center border border-green-400 text-base"
          >
            <Settings size={18} />
            הגדר פרופיל ומשלוח
          </Link>
        </div>
      </div>

    </div>
  );
}
