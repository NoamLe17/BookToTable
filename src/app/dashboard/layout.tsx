'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Book, Settings, LogOut, Package, BookOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const pathname = usePathname();

  useEffect(() => {
    // Basic active state based on URL hash or pathname
    const handleHashChange = () => {
      if (pathname === '/dashboard/profile') {
        setActiveSection('profile');
      } else {
        const hash = window.location.hash.replace('#', '') || 'overview';
        setActiveSection(hash);
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [pathname]);

  const navItems = [
    { name: 'ראשי', href: '#overview', id: 'overview', icon: LayoutDashboard },
    { name: 'הספרים שלי', href: '#books', id: 'books', icon: Book },
    { name: 'הזמנות', href: '#orders', id: 'orders', icon: Package },
    { name: 'עריכת פרופיל', href: '/dashboard/profile', id: 'profile', icon: Settings },
    { name: 'מדריך לסופר', href: '/dashboard/guide', id: 'guide', icon: BookOpen },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-l border-gray-200 shadow-sm flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xl overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">פאנל סופר</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              if (item.href.startsWith('/')) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium border-2 ${
                      isActive
                        ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={18} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                    {item.name}
                  </Link>
                );
              }

              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium border-2 ${
                    isActive
                      ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon size={18} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                  {item.name}
                </a>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all font-medium"
            >
              <LogOut size={18} />
              התנתקות
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
