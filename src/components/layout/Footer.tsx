'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, X } from 'lucide-react';

export default function Footer() {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setContactError('');

    try {
      const res = await fetch('/api/email/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (!res.ok) throw new Error('שגיאה בשליחת הפנייה');

      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      setContactError('אירעה שגיאה. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <Image
                src="/logo-icon.png"
                alt="Book To Table"
                width={40}
                height={40}
                className="rounded-xl shadow-sm"
              />
              <div>
                <span className="font-black text-xl text-gray-900 block leading-none">BookToTable</span>
                <span className="text-xs text-green-600 font-semibold block mt-0.5">מהסופר לשולחן הקריאה</span>
              </div>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              פלטפורמה דיגיטלית המעצימה סופרים עצמאיים למכור ספרים ישירות לקוראים —
              ללא מתווכים, ללא עמלות בשלב ההשקה, עם מינימום בירוקרטיה.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <button onClick={() => setIsContactOpen(true)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </button>
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
              {contactSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">הפנייה נשלחה בהצלחה!</h3>
                  <p className="text-gray-600 mb-6">תודה שפנית אלינו, נחזור אליך בהקדם.</p>
                  <button onClick={() => { setIsContactOpen(false); setContactSuccess(false); }} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-xl transition-all">סגור</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    נשמח לעמוד לשירותך בכל שאלה. השאר פרטים ונחזור אליך בהקדם:
                  </p>
                  
                  {contactError && <div className="text-red-500 text-sm mb-4">{contactError}</div>}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                    <input required type="text" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none text-right" dir="rtl" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">אימייל לחזרה</label>
                    <input required type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none text-left" dir="ltr" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תוכן הפנייה</label>
                    <textarea required rows={4} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none resize-none text-right" dir="rtl" />
                  </div>
                  
                  <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all mt-4">
                    {isSubmitting ? 'שולח...' : 'שלח פנייה'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
