'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import {
  Send, Users, User, Mail, ChevronDown, ChevronUp,
  CheckSquare, Square, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserRow {
  id: string;
  name: string;
  email: string;
}

export default function BroadcastPage() {
  const { firebaseUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ succeeded: number; failed: number; total: number } | null>(null);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        setUsers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingUsers(false);
      }
    }
    load();
  }, []);

  const toggleUser = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(users.map(u => u.id)));
  const clearAll = () => setSelectedIds(new Set());

  const handleSend = async () => {
    if (!subject.trim()) { toast.error('נא להזין נושא'); return; }
    if (!message.trim()) { toast.error('נא להזין תוכן ההודעה'); return; }
    if (!sendToAll && selectedIds.size === 0) { toast.error('נא לבחור לפחות משתמש אחד'); return; }
    if (!firebaseUser?.email) return;

    const recipientCount = sendToAll ? users.length : selectedIds.size;
    const confirm = window.confirm(
      `שליחת מייל ל-${recipientCount} נמענים?\n\nנושא: ${subject}`
    );
    if (!confirm) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/email/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          targetUserIds: sendToAll ? [] : Array.from(selectedIds),
          adminEmail: firebaseUser.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('שגיאה: ' + (data.error || 'Unknown error'));
      } else {
        setResult({ succeeded: data.succeeded, failed: data.failed, total: data.total });
        toast.success(`נשלח בהצלחה ל-${data.succeeded} מתוך ${data.total} נמענים`);
        if (data.succeeded === data.total) {
          setSubject('');
          setMessage('');
          setSelectedIds(new Set());
        }
      }
    } catch (e: any) {
      toast.error('שגיאת רשת: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const recipientCount = sendToAll ? users.length : selectedIds.size;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
          <Send size={26} className="text-red-600" />
          שליחת מייל לסופרים
        </h1>
        <p className="text-gray-500 mt-1 text-sm">שלח הודעת מייל לכל המשתמשים בפלטפורמה, או לסופרים נבחרים.</p>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`rounded-2xl p-4 flex items-start gap-3 ${result.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          {result.failed === 0 ? (
            <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold text-sm">
              {result.failed === 0
                ? `✅ כל ${result.total} המיילים נשלחו בהצלחה!`
                : `⚠️ נשלח ל-${result.succeeded} מתוך ${result.total}. ${result.failed} נכשלו.`}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-5">

        {/* Recipients */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">נמענים</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setSendToAll(true)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-colors flex-1 justify-center ${
                sendToAll ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Users size={17} />
              כל המשתמשים
              {!loadingUsers && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${sendToAll ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {users.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setSendToAll(false); setShowUserList(true); }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-colors flex-1 justify-center ${
                !sendToAll ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <User size={17} />
              סופרים נבחרים
              {!sendToAll && selectedIds.size > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-200 text-blue-800">
                  {selectedIds.size}
                </span>
              )}
            </button>
          </div>

          {/* User picker */}
          {!sendToAll && (
            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                onClick={() => setShowUserList(!showUserList)}
              >
                <span className="text-sm font-bold text-gray-700">
                  {loadingUsers ? 'טוען משתמשים...' : `בחר מ-${users.length} משתמשים`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); selectAll(); }}
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >בחר הכל</button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); clearAll(); }}
                    className="text-xs text-gray-500 font-medium hover:underline"
                  >נקה</button>
                  {showUserList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {showUserList && (
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
                  {users.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleUser(u.id)}
                    >
                      <div className="shrink-0">
                        {selectedIds.has(u.id)
                          ? <CheckSquare size={18} className="text-blue-600" />
                          : <Square size={18} className="text-gray-300" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{u.name || 'ללא שם'}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && !loadingUsers && (
                    <p className="p-4 text-center text-gray-400 text-sm">אין משתמשים</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">נושא המייל</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="לדוגמה: עדכון חשוב מסיפור קרוב"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            dir="rtl"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">תוכן ההודעה</label>
          <textarea
            rows={8}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="כתוב כאן את ההודעה שתשלח לסופרים...&#10;&#10;ניתן להשתמש בשורות חדשות."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
            dir="rtl"
          />
          <p className="text-xs text-gray-400 mt-1">ההודעה תשלח כמייל ממוסגר עם לוגו וצבעי הפלטפורמה.</p>
        </div>

        {/* Send button */}
        <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail size={16} className="text-gray-400" />
            <span>
              {recipientCount === 0 ? 'לא נבחרו נמענים' : `שליחה ל-${recipientCount} נמענים`}
            </span>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || recipientCount === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 shadow-sm"
          >
            {sending ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                שולח מיילים...
              </>
            ) : (
              <>
                <Send size={17} />
                שלח מייל
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
        <p className="font-bold mb-2 flex items-center gap-1.5"><AlertCircle size={15} /> טיפים לשליחה:</p>
        <ul className="space-y-1 text-blue-700 text-xs">
          <li>• ה-Resend בחינם מגביל שליחה ל-3 מיילים לדקה — לרשימות גדולות ייתכן שייקח זמן.</li>
          <li>• לשליחה לכתובות חיצוניות (לא Gmail שלך), יש לאמת דומיין ב-Resend.</li>
          <li>• בדוק תמיד את הנושא וההודעה לפני שליחה לכולם.</li>
        </ul>
      </div>
    </div>
  );
}
