'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Bell, LayoutDashboard, Send } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser || firebaseUser.email !== 'noamhemo2001@gmail.com') {
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [firebaseUser, loading, router]);

  // Subscribe to unread count directly — simpler, more reliable
  useEffect(() => {
    if (!isAuthorized) return;

    try {
      const q = query(
        collection(db, 'admin_notifications'),
        where('read', '==', false),
        limit(50)
      );
      const unsub = onSnapshot(q, (snap) => {
        setUnreadCount(snap.size);
      }, (err) => {
        console.warn('Notifications listener error:', err);
      });
      return unsub;
    } catch (e) {
      console.warn('Could not subscribe to notifications:', e);
    }
  }, [isAuthorized]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'סקירה', icon: LayoutDashboard, badge: 0 },
    { href: '/admin/notifications', label: 'התראות', icon: Bell, badge: unreadCount },
    { href: '/admin/broadcast', label: 'שלח מייל', icon: Send, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-red-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between py-2.5 sm:py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-2xl font-black whitespace-nowrap">⚡ Admin</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold hidden sm:inline">BookToTable</span>
            </div>
            <span className="text-xs opacity-80 truncate max-w-[130px] sm:max-w-[220px]">
              {firebaseUser?.email}
            </span>
          </div>

          {/* Nav tabs — scroll horizontally on very small screens */}
          <div className="flex gap-1 pb-1 overflow-x-auto scrollbar-none">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-t-lg text-xs sm:text-sm font-bold transition-colors relative whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white text-red-600'
                      : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <item.icon size={14} className="shrink-0" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] bg-yellow-400 text-gray-900 rounded-full text-xs font-black flex items-center justify-center px-1">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
