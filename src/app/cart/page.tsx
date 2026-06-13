'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">העגלה שלך ריקה</h1>
          <p className="text-gray-500 mb-8 font-medium">נראה שעדיין לא מצאת את הספר הבא שלך. בחנות מחכים לך אלפי ספרים נהדרים!</p>
          <Link 
            href="/#books"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md"
          >
            חזרה לחנות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/#books" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowRight size={20} />
          </Link>
          <h1 className="text-3xl font-black text-gray-900">עגלת הקניות שלך ({totalItems})</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items List */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">פריטים בעגלה</h2>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.book.id} className="p-6 flex gap-6 hover:bg-gray-50 transition-colors">
                  <div className="w-24 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
                    {item.book.coverUrl ? (
                      <img src={item.book.coverUrl} alt={item.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{item.book.title}</h3>
                        <p className="text-sm font-medium text-gray-500">מאת: {item.book.authorName}</p>
                      </div>
                      <div className="text-xl font-black text-gray-900">
                        ₪{(item.book.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded text-gray-600 shadow-sm font-bold hover:text-green-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded text-gray-600 shadow-sm font-bold hover:text-green-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.book.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="הסר מהעגלה"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
              <h2 className="text-lg font-bold text-gray-900 mb-6">סיכום הזמנה</h2>
              
              <div className="space-y-4 text-gray-600 mb-6 font-medium">
                <div className="flex justify-between">
                  <span>ספרים ({totalItems} פריטים)</span>
                  <span className="text-gray-900">₪{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>דמי משלוח</span>
                  <span className="text-gray-400 text-sm">יחושב בשלב הבא</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">סך הכל ביניים</span>
                  <span className="text-2xl font-black text-gray-900">₪{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all text-lg"
              >
                המשך לקופה
              </Link>
              
              <div className="mt-4 flex items-center justify-center gap-4 text-gray-400">
                <span className="text-xs font-medium">תשלום מאובטח ב-100%</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
