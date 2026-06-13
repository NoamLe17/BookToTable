'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Book } from '@/types';
import toast from 'react-hot-toast';

export default function AddToCartButton({ book }: { book: Book }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(book);
    toast.success(`"${book.title}" נוסף לעגלה!`, {
      icon: '🛒',
    });
  };

  return (
    <button 
      onClick={handleAdd}
      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-3"
    >
      <ShoppingCart size={22} />
      הוסף לעגלה
    </button>
  );
}
