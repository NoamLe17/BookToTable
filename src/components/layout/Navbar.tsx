'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { BookOpen, User, LogOut, Menu, X, LayoutDashboard, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const { user, firebaseUser, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo (Right) */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <BookOpen size={24} />
            </div>
            <span className="font-black text-2xl text-gray-900 tracking-tight">BookToTable</span>
          </Link>

          {/* Desktop Nav (Center) */}
          <div className="hidden md:flex items-center gap-2 mr-6">
            <Link 
              href="/books" 
              className={`px-4 py-2 rounded-full font-medium transition-all ${isActive('/books') ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`}
            >
              ספרים
            </Link>
            <Link 
              href="/about" 
              className={`px-4 py-2 rounded-full font-medium transition-all ${isActive('/about') ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`}
            >
              אודות המיזם
            </Link>
          </div>

          {/* Actions (Left) */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors flex items-center justify-center">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-green-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {firebaseUser?.email === 'noamhemo2001@gmail.com' && (
                  <Link 
                    href="/admin" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isActive('/admin') ? 'bg-red-50 text-red-700 ring-1 ring-red-100' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    ⚡ פאנל ניהול
                  </Link>
                )}
                <Link 
                  href="/dashboard" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${isActive('/dashboard') ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`}
                >
                  <LayoutDashboard size={18} /> לוח בקרה
                </Link>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <div className="w-8 h-8 bg-green-50 text-green-700 rounded-full flex items-center justify-center border border-green-100 overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  {user?.name}
                </div>
                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" title="התנתקות">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg">
                  התחברות/הצטרפות כסופר
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-4">
            {/* Mobile Cart Icon */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors flex items-center justify-center">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-green-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button className="p-2 text-gray-600 hover:text-green-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 shadow-lg absolute w-full left-0 right-0">
          <div className="flex flex-col space-y-4">
            <Link href="/books" className="text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>ספרים</Link>
            <Link href="/about" className="text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>אודות המיזם</Link>
            
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  {firebaseUser?.email === 'noamhemo2001@gmail.com' && (
                    <Link href="/admin" className="text-red-600 font-bold" onClick={() => setMobileOpen(false)}>⚡ פאנל ניהול</Link>
                  )}
                  <Link href="/dashboard" className="text-green-600 font-bold" onClick={() => setMobileOpen(false)}>לוח בקרה</Link>
                  <button onClick={logout} className="text-red-500 text-right font-medium">התנתקות</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="bg-green-600 text-white text-center py-2.5 rounded-lg font-bold shadow-md" onClick={() => setMobileOpen(false)}>התחברות/הצטרפות כסופר</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
