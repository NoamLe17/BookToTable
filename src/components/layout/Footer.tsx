'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, Leaf, X } from 'lucide-react';

export default function Footer() {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-2xl gradient-text">BookToTable</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              פלטפורמה דיגיטלית המעצימה סופרים עצמאיים למכור ספרים ישירות לקוראים. 
              מודל הוגן ושקוף – פרט לעלויות שילוח וסליקה, כל הכסף מהמכירה הולך ישירות אליכם.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="mailto:noamhemo2001@gmail.com" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">פלטפורמה</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'גלה ספרים' },
                { href: '/about', label: 'אודות' },
                { href: '/auth/login', label: 'התחברות/הצטרפות כסופר' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">תמיכה</h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => setIsFaqOpen(true)} className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  שאלות נפוצות
                </button>
              </li>
              <li>
                <button onClick={() => setIsContactOpen(true)} className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  צור קשר
                </button>
              </li>
              <li>
                <Link href="/legal" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  מדיניות פרטיות ותנאי שימוש
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                  הצהרת נגישות
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} BookToTable. כל הזכויות שמורות.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>🔒 תשלום ישיר ובטוח לסופר</span>
            <span>·</span>
            <span>🚀 משלוח מהיר בישראל</span>
          </div>
        </div>
      </div>

      {/* FAQ Modal */}
      {isFaqOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">שאלות נפוצות</h2>
              <button onClick={() => setIsFaqOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">איך הספרים מגיעים אליי?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">הספרים נשלחים ישירות מבית הסופר. ברגע שאתה רוכש, הסופר מקבל התראה, אורז את הספר באהבה ושולח אותו אליך.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">איך התשלום מועבר לסופר?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">במודל הייחודי שלנו, התשלום מבוצע ישירות מהקורא לסופר (דרך Paybox, Bit, או אשראי). הסופר מקבל 100% מהסכום שהעברת אליו, ללא עמלות תיווך לפלטפורמה.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">מה קורה אם קניתי ספרים משני סופרים שונים?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">תשלם דמי משלוח עבור כל סופר בנפרד (מכיוון שיוצאות שתי חבילות משני בתים שונים), אך חווית הרכישה בקופה היא מרוכזת ואחת.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">צור קשר</h2>
              <button onClick={() => setIsContactOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                נשמח לעמוד לשירותך בכל שאלה. תוכל לשלוח לנו הודעה ישירות למייל, ואנו נשתדל לענות בהקדם האפשרי.
              </p>
              <a href="mailto:noamhemo2001@gmail.com" className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-bold transition-all">
                <Mail size={20} />
                שלח אימייל (noamhemo2001@gmail.com)
              </a>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
