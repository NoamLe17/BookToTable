'use client';

import React, { useState, useMemo } from 'react';
import { Book } from '@/types';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';

export default function BooksStore({ books }: { books: Book[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(200);
  const [selectedGenre, setSelectedGenre] = useState('');

  // Extract unique genres
  const genres = useMemo(() => {
    const allGenres = books.map(b => b.genre).filter(Boolean) as string[];
    return [...new Set(allGenres)];
  }, [books]);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (book.authorName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = book.price <= maxPrice;
      const matchesGenre = selectedGenre ? book.genre === selectedGenre : true;
      return matchesSearch && matchesPrice && matchesGenre;
    });
  }, [books, searchTerm, maxPrice, selectedGenre]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4">חנות הספרים שלנו</h1>
        <p className="text-xl text-gray-500 font-medium">גלה מאות ספרים נהדרים שנכתבו על ידי סופרים ישראלים עצמאיים. תמוך ישירות ביוצר.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-green-600" />
              סינון ספרים
            </h3>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">חיפוש</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="שם ספר או סופר..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
                <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">מחיר מקסימלי: ₪{maxPrice}</label>
              <input 
                type="range" 
                min="0" 
                max="200" 
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
                <span>₪0</span>
                <span>₪200</span>
              </div>
            </div>

            {/* Genre Filter */}
            {genres.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">ז'אנר</label>
                <div className="space-y-2">
                  <button 
                    onClick={() => setSelectedGenre('')}
                    className={`w-full text-right text-sm py-1.5 px-3 rounded-md transition-colors ${selectedGenre === '' ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    כל הז'אנרים
                  </button>
                  {genres.map(genre => (
                    <button 
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`w-full text-right text-sm py-1.5 px-3 rounded-md transition-colors ${selectedGenre === genre ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Books Grid */}
        <div className="flex-1">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">לא נמצאו ספרים</h3>
              <p className="text-gray-500 font-medium">נסה לשנות את מסנני החיפוש או המחיר.</p>
              <button 
                onClick={() => { setSearchTerm(''); setMaxPrice(200); setSelectedGenre(''); }}
                className="mt-6 text-green-600 font-bold hover:underline"
              >
                נקה סינונים
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredBooks.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="aspect-[2/3] w-full bg-gray-50 relative overflow-hidden">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <BookOpen size={48} className="mb-4 opacity-50" />
                        <span className="font-medium">אין תמונת כריכה</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm">
                      ₪{book.price}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 font-medium">מאת: {book.authorName}</p>
                    
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-400 font-medium">{book.salesCount} נמכרו</span>
                      <span className="text-green-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        לרכישה &larr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
