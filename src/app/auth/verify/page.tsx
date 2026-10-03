'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, refreshUser } = useAuth();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Extract info from query params or active user
  const email = searchParams.get('email') || firebaseUser?.email || '';
  const name = searchParams.get('name') || firebaseUser?.displayName || '';
  const uid = searchParams.get('uid') || firebaseUser?.uid || '';

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^[0-9]+$/.test(value)) return;
    
    // Handle paste event where a user pastes multiple numbers in one field
    if (value.length > 1) {
      const pasteData = value.slice(0, 6).split('');
      const newCode = [...code];
      pasteData.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      
      // Focus the correct next input
      const nextIndex = Math.min(index + pasteData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Go back on empty backspace
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('אנא הזן קוד בן 6 ספרות');
      return;
    }
    
    if (!uid) {
      setError('שגיאה בזיהוי משתמש. נסה להתחבר מחדש.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, code: fullCode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'שגיאה באימות הקוד');
      }

      setSuccess(true);
      if (refreshUser) {
        await refreshUser(); // Update client state to reflect emailVerified = true
      }
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה באימות הקוד';
      setError(message);
      // Clear code on error for better UX
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!uid || !email) {
      setError('שגיאה בפרטי המשתמש לשליחת קוד חוזר.');
      return;
    }
    
    setIsResending(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email, name })
      });

      if (!res.ok) {
        throw new Error('שגיאה בשליחת המייל');
      }
      
      alert('קוד חדש נשלח אליך בהצלחה!');
      // Reset inputs
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('לא הצלחנו לשלוח קוד חדש, נסה שוב מאוחר יותר.');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-8">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">אימות הושלם!</h2>
        <p className="text-gray-600">החשבון שלך אומת בהצלחה. מעביר אותך ללוח הבקרה...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 text-center">
      <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
        <Mail size={28} className="text-green-600" />
      </div>
      
      <h2 className="text-2xl font-black text-gray-900 mb-2">אמת את כתובת המייל</h2>
      <p className="text-gray-600 mb-8 leading-relaxed">
        שלחנו קוד אימות בן 6 ספרות לכתובת<br />
        <strong className="text-gray-900" dir="ltr">{email}</strong>
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 text-right text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center gap-2 md:gap-3 mb-8" dir="ltr">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6} // to allow pasting multiple chars in one go
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all shadow-sm"
              disabled={isVerifying}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isVerifying || code.join('').length !== 6}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-100 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-600/20"
        >
          {isVerifying ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>מאמת קוד...</span>
            </>
          ) : (
            'אמת והמשך'
          )}
        </button>
      </form>

      <div className="mt-8 text-sm text-gray-500">
        לא קיבלת את הקוד?{' '}
        <button 
          onClick={handleResend} 
          disabled={isResending}
          className="text-green-600 font-bold hover:text-green-700 disabled:opacity-50 transition-colors"
        >
          {isResending ? 'שולח...' : 'שלח שוב'}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-green-600" size={32} /></div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
