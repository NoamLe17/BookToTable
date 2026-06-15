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
  
  // Payment Methods State
  const [hasBit, setHasBit] = useState(!!user?.paymentMethods?.bit);
  const [bitPhone, setBitPhone] = useState(user?.paymentMethods?.bit || '');
  const [hasPaybox, setHasPaybox] = useState(!!user?.paymentMethods?.paybox);
  const [payboxLink, setPayboxLink] = useState(user?.paymentMethods?.paybox || '');
  const [hasCreditCard, setHasCreditCard] = useState(!!user?.paymentMethods?.creditCard);
  const [creditCardLink, setCreditCardLink] = useState(user?.paymentMethods?.creditCard || '');
  const [hasBankTransfer, setHasBankTransfer] = useState(!!user?.paymentMethods?.bankTransfer);
  const [bankName, setBankName] = useState(user?.paymentMethods?.bankTransfer?.bankName || '');
  const [bankBranch, setBankBranch] = useState(user?.paymentMethods?.bankTransfer?.branch || '');
  const [bankAccount, setBankAccount] = useState(user?.paymentMethods?.bankTransfer?.account || '');
  const [bankAccountName, setBankAccountName] = useState(user?.paymentMethods?.bankTransfer?.accountName || '');

  const [phone, setPhone] = useState(user?.pickupAddress?.phone || '');
  const [pickupCity, setPickupCity] = useState(user?.pickupAddress?.city || '');
  const [pickupStreet, setPickupStreet] = useState(user?.pickupAddress?.street || '');
  const [pickupZip, setPickupZip] = useState(user?.pickupAddress?.zip || '');
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
          setHasBit(!!u.paymentMethods?.bit);
          setBitPhone(u.paymentMethods?.bit || '');
          setHasPaybox(!!u.paymentMethods?.paybox);
          setPayboxLink(u.paymentMethods?.paybox || '');
          setHasCreditCard(!!u.paymentMethods?.creditCard);
          setCreditCardLink(u.paymentMethods?.creditCard || '');
          setHasBankTransfer(!!u.paymentMethods?.bankTransfer);
          setBankName(u.paymentMethods?.bankTransfer?.bankName || '');
          setBankBranch(u.paymentMethods?.bankTransfer?.branch || '');
          setBankAccount(u.paymentMethods?.bankTransfer?.account || '');
          setBankAccountName(u.paymentMethods?.bankTransfer?.accountName || '');
          setPhone(u.pickupAddress?.phone || '');
          setPickupCity(u.pickupAddress?.city || '');
          setPickupStreet(u.pickupAddress?.street || '');
          setPickupZip(u.pickupAddress?.zip || '');
        }
      } else {
        setTargetUser(user);
        if (user) {
          setBio(user.bio || '');
          setAge(user.age || '');
          setHasBit(!!user.paymentMethods?.bit);
          setBitPhone(user.paymentMethods?.bit || '');
          setHasPaybox(!!user.paymentMethods?.paybox);
          setPayboxLink(user.paymentMethods?.paybox || '');
          setHasCreditCard(!!user.paymentMethods?.creditCard);
          setCreditCardLink(user.paymentMethods?.creditCard || '');
          setHasBankTransfer(!!user.paymentMethods?.bankTransfer);
          setBankName(user.paymentMethods?.bankTransfer?.bankName || '');
          setBankBranch(user.paymentMethods?.bankTransfer?.branch || '');
          setBankAccount(user.paymentMethods?.bankTransfer?.account || '');
          setBankAccountName(user.paymentMethods?.bankTransfer?.accountName || '');
          setPhone(user.pickupAddress?.phone || '');
          setPickupCity(user.pickupAddress?.city || '');
          setPickupStreet(user.pickupAddress?.street || '');
          setPickupZip(user.pickupAddress?.zip || '');
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

      const paymentMethods: any = {};
      if (hasBit && bitPhone) paymentMethods.bit = bitPhone;
      if (hasPaybox && payboxLink) paymentMethods.paybox = payboxLink;
      if (hasCreditCard && creditCardLink) paymentMethods.creditCard = creditCardLink;
      if (hasBankTransfer && bankName && bankBranch && bankAccount && bankAccountName) {
        paymentMethods.bankTransfer = {
          bankName,
          branch: bankBranch,
          account: bankAccount,
          accountName: bankAccountName
        };
      }

      await updateDoc(doc(db, 'users', targetUid), {
        bio,
        age,
        paymentMethods,
        pickupAddress: {
          phone,
          city: pickupCity,
          street: pickupStreet,
          zip: pickupZip,
        },
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
              {/* Payment Methods */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-md font-bold text-gray-900">אמצעי תשלום נתמכים</h3>
                  <button 
                    type="button" 
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <HelpCircle size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">סמן אילו אמצעי תשלום תרצה להציג לרוכשים שלך כדי שיעבירו לך את הכסף.</p>
                
                <div className="space-y-4">
                  {/* Bit */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input type="checkbox" checked={hasBit} onChange={(e) => setHasBit(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
                      <span className="font-bold text-gray-800">אפליקציית Bit</span>
                    </label>
                    {hasBit && (
                      <div className="mt-3 pl-8">
                        <label className="block text-sm text-gray-600 mb-1">מספר טלפון להעברה</label>
                        <input type="tel" value={bitPhone} onChange={(e) => setBitPhone(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3" placeholder="050-0000000" dir="ltr" />
                      </div>
                    )}
                  </div>

                  {/* Paybox */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input type="checkbox" checked={hasPaybox} onChange={(e) => setHasPaybox(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
                      <span className="font-bold text-gray-800">אפליקציית Paybox</span>
                    </label>
                    {hasPaybox && (
                      <div className="mt-3 pl-8">
                        <label className="block text-sm text-gray-600 mb-1">קישור אישי (קופה / אישי)</label>
                        <input type="url" value={payboxLink} onChange={(e) => setPayboxLink(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3" placeholder="https://payboxapp.page.link/..." dir="ltr" />
                      </div>
                    )}
                  </div>

                  {/* Bank Transfer */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input type="checkbox" checked={hasBankTransfer} onChange={(e) => setHasBankTransfer(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
                      <span className="font-bold text-gray-800">העברה בנקאית</span>
                    </label>
                    {hasBankTransfer && (
                      <div className="mt-3 pl-8 grid grid-cols-2 gap-3">
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs text-gray-600 mb-1">שם הבנק</label>
                          <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3" placeholder="פועלים / לאומי" />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs text-gray-600 mb-1">מספר סניף</label>
                          <input type="text" value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3" placeholder="123" />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs text-gray-600 mb-1">מספר חשבון</label>
                          <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3" placeholder="123456" />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs text-gray-600 mb-1">שם בעל החשבון</label>
                          <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3" placeholder="ישראל ישראלי" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Credit Card */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input type="checkbox" checked={hasCreditCard} onChange={(e) => setHasCreditCard(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
                      <span className="font-bold text-gray-800">סליקה באשראי (PayPlus / משולם וכו')</span>
                    </label>
                    {hasCreditCard && (
                      <div className="mt-3 pl-8">
                        <label className="block text-sm text-gray-600 mb-1">קישור לדף תשלום</label>
                        <input type="url" value={creditCardLink} onChange={(e) => setCreditCardLink(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3" placeholder="https://..." dir="ltr" />
                      </div>
                    )}
                  </div>
                </div>
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

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-md font-bold text-gray-900 mb-4">פרטי איסוף לשליח</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">טלפון נייד לאיסוף</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">עיר איסוף</label>
                    <input 
                      type="text" 
                      value={pickupCity}
                      onChange={(e) => setPickupCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">מיקוד איסוף</label>
                    <input 
                      type="text" 
                      value={pickupZip}
                      onChange={(e) => setPickupZip(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">רחוב ומספר איסוף</label>
                  <input 
                    type="text" 
                    value={pickupStreet}
                    onChange={(e) => setPickupStreet(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="הרקפת 12, דירה 4"
                  />
                </div>
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
