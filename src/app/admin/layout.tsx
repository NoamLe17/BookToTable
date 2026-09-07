'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Bell, Users, BookOpen, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { subscribeToNotifications, AdminNotification } from '@/lib/firestore';

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

  // Subscribe to unread notifications count
  useEffect(() => {
    if (!isAuthorized) return;
    const unsub = subscribeToNotifications((notifs: AdminNotification[]) => {
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
    return unsub;
  }, [isAuthorized]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'סקירה כללית', icon: LayoutDashboard },
    { href: '/admin/notifications', label: 'התראות', icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-red-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-black">⚡ Super Admin</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold hidden sm:inline">BookToTable</span>
            </div>
            <span className="text-xs sm:text-sm opacity-90 truncate max-w-[180px]">{firebaseUser?.email}</span>
          </div>
          {/* Nav tabs */}
          <div className="flex gap-1 pb-1">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-sm font-bold transition-colors relative ${
                    isActive ? 'bg-white text-red-600' : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <item.icon size={15} />
                  <span>{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-yellow-400 text-gray-900 rounded-full text-xs font-black flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
