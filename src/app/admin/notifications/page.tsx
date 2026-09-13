'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { updateDoc, doc } from 'firebase/firestore';
import {
  Bell,
  BellOff,
  UserPlus,
  BookOpen,
  ShoppingBag,
  Trash2,
  CheckCheck,
  Check,
  Clock,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface AdminNotification {
  id: string;
  type: 'new_user' | 'new_book' | 'new_order' | 'book_deleted' | 'user_deleted';
  title: string;
  message: string;
  entityId: string;
  entityType: 'user' | 'book' | 'order';
  read: boolean;
  createdAt: number;
}

const TYPE_META: Record<AdminNotification['type'], {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
}> = {
  new_user: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100', label: 'משתמש חדש' },
  new_book: { icon: BookOpen, color: 'text-green-600', bg: 'bg-green-100', label: 'ספר חדש' },
  new_order: { icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100', label: 'הזמנה' },
  book_deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100', label: 'ספר נמחק' },
  user_deleted: { icon: Trash2, color: 'text-red-700', bg: 'bg-red-100', label: 'משתמש נמחק' },
};

const ENTITY_LINK: Record<AdminNotification['entityType'], (id: string) => string> = {
  user: (id) => `/admin`,
  book: (id) => `/books/${id}`,
  order: (id) => `/admin`,
};

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'עכשיו';
  if (m < 60) return `לפני ${m} דקות`;
  if (h < 24) return `לפני ${h} שעות`;
  return `לפני ${d} ימים`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    // Use a simple collection snapshot without orderBy to avoid needing a composite index.
    // We sort the results in memory instead.
    const q = query(
      collection(db, 'admin_notifications'),
      limit(200)
    );

    const unsub = onSnapshot(q, (snap) => {
      const notifs: AdminNotification[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        } as AdminNotification;
      });
      // Sort descending by createdAt in memory
      notifs.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(notifs);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Notifications snapshot error:', err);
      setError('שגיאה בטעינת ההתראות: ' + err.message);
      setLoading(false);
    });

    return unsub;
  }, []);


  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'admin_notifications', n.id), { read: true })));
    } catch (e) {
      console.error('markAllRead error:', e);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await updateDoc(doc(db, 'admin_notifications', id), { read: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Bell className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 font-medium">טוען התראות...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto mt-8">
        <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-red-700 mb-1">שגיאה בטעינת ההתראות</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <p className="text-gray-500 text-xs mt-3">
          ייתכן שה-collection עדיין ריק. התראות ייווצרו אוטומטית כשיצטרפו משתמשים חדשים, יועלו ספרים, או יתקבלו הזמנות.
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <Bell size={28} className="text-red-600" />
            מרכז התראות
          </h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? (
              <span className="text-red-600 font-bold">{unreadCount} לא נקראו</span>
            ) : (
              'הכל עדכני ✓'
            )}
            {' '} · סה״כ {notifications.length} התראות
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Filter tabs */}
          <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
            {[
              { id: 'all' as const, label: 'הכל' },
              { id: 'unread' as const, label: `לא נקראו (${unreadCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  filter === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
              <CheckCheck size={16} />
              {markingAll ? 'מסמן...' : 'סמן הכל כנקרא'}
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <BellOff className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-xl font-bold text-gray-500">אין התראות</h3>
          <p className="text-gray-400 mt-1 text-sm">
            {filter === 'unread' ? 'כל ההתראות נקראו!' : 'לא התקבלו עדיין התראות.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const meta = TYPE_META[notif.type] || TYPE_META.new_book;
            const Icon = meta.icon;
            const entityLink = ENTITY_LINK[notif.entityType]?.(notif.entityId);

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${
                  notif.read ? 'border-gray-100 opacity-75' : 'border-gray-200 ring-1 ring-blue-100'
                }`}
              >
                <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon size={20} className={meta.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">{notif.title}</h3>
                        <p className="text-gray-500 text-sm mt-0.5">{notif.message}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 shrink-0" />
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {timeAgo(notif.createdAt)}
                      </span>
                      {entityLink && (
                        <Link
                          href={entityLink}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <ExternalLink size={12} />
                          צפה
                        </Link>
                      )}
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          <Check size={12} />
                          סמן כנקרא
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
