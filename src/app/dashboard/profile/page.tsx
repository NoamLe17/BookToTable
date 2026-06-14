'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Settings, HelpCircle, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { User } from '@/types';
import { useSearchParams } from 'next/navigation';
import { getUserById } from '@/lib/firestore';

function ProfileContent() {
  const { firebaseUser, user } = useAuth();
  const searchParams = useSearchParams();
  
  const impersonateUid = searchParams.get('impersonate');
  const isAdmin = firebaseUser?.email === 'noamhemo2001@gmail.com';
  const targetUid = (isAdmin && impersonateUid) ? impersonateUid : firebaseUser?.uid;

  const [targetUser, setTargetUser] = useState<User | null>(null);

  // Settings State
  const [bio, setBio] = useState(user?.bio || '');
  const [age, setAge] = useState(user?.age || '');
  const [paymentLink, setPaymentLink] = useState(user?.paymentLink || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    async function fetchTargetUser() {
      if (isAdmin && impersonateUid) {
        const u = await getUserById(impersonateUid);
        setTargetUser(u);
        if (u) {
          setBio(u.bio || '');
          setAge(u.age || '');
          setPaymentLink(u.paymentLink || '');
        }
      } else {
        setTargetUser(user);
        if (user) {
          setBio(user.bio || '');
          setAge(user.age || '');
          setPaymentLink(user.paymentLink || '');
        }
      }
    }
    if (firebaseUser) fetchTargetUser();
  }, [firebaseUser, user, isAdmin, impersonateUid]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUid) return;
    setSavingSettings(true);

    try {
      let avatarUrl = targetUser?.avatarUrl;

      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${targetUid}_${Date.now()}`);
        await uploadBytes(storageRef, avatarFile);
        avatarUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'users', targetUid), {
        bio,
        age,
        paymentLink,
        ...(avatarUrl && { avatarUrl })
      });

      alert('הפרופיל עודכן בהצלחה!');
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('אירעה שגיאה בשמירת הפרופיל');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings size={24} className="text-green-600" />
            עריכת פרופיל סופר
          </h2>
          <p className="text-gray-500 mt-1">הפרופיל הציבורי שלך כפי שיוצג לרוכשים.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : targetUser?.avatarUrl ? (
                  <img src={targetUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl">
                    {targetUser?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <label className="text-sm text-green-600 font-bold cursor-pointer hover:underline">
                שנה תמונה
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">גיל</label>
                <input 
                  type="text" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full md:w-1/3 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="למשל: 34"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-bold text-gray-700">קישור לתשלום (Paybox / אשראי / Bit) *</label>
                  <button 
                    type="button" 
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <HelpCircle size={16} />
                  </button>
                </div>
                <input 
                  type="url" 
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://payboxapp.page.link/..."
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">חובה! לשם יועברו התשלומים מהרוכשים.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">קצת עליי (ביוגרפיה)</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="ספר לקוראים קצת על עצמך, מאיפה ההשראה שלך לספרים..."
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={savingSettings}
                  className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {savingSettings ? 'שומר...' : 'שמור שינויים'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden relative">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">איך עובד התשלום הישיר?</h3>
                <button 
                  onClick={() => setIsHelpModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                <p>במודל הנוכחי, התשלום מהקורא עובר ישירות אליך ללא עמלות תיווך! כדי לקבל תשלום, עליך להדביק כאן קישור קבוע אליו יופנו הקוראים בסיום ההזמנה.</p>
                
                <ul className="list-disc pr-5 space-y-3">
                  <li><strong>לסופרים פרטיים (ללא עוסק):</strong> מומלץ לפתוח "קופה" חינמית באפליקציית Paybox (יש להגדיר בהגדרות הקופה שהיא 'פרטית'), ולהדביק כאן את הקישור שנוצר לקופה.</li>
                  <li><strong>לסופרים בעלי עסק רשום:</strong> ניתן להדביק כאן קישור קבוע לדף תשלום באשראי שהפקתם דרך חברת הסליקה שלכם (כמו משולם, PayPlus, אשורית וכו').</li>
                </ul>

                <div className="mt-6 bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl font-medium">
                  <strong>שימו לב:</strong> באחריותכם המלאה לוודא שהתשלום אכן נכנס לחשבונכם לפני שאתם אורזים ושולחים את הספר לקורא!
                </div>
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={() => setIsHelpModalOpen(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  הבנתי, תודה!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">טוען פרופיל...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
