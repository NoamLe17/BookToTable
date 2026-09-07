'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Book } from '@/types';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen, X, ChevronRight } from 'lucide-react';

interface FilterState {
  searchTerm: string;
  maxPrice: number;
  selectedGenre: string;
}

function FilterPanel({
  filters,
  genres,
  onChange,
  totalBooks,
  filteredCount,
}: {
  filters: FilterState;
  genres: string[];
  onChange: (key: keyof FilterState, value: string | number) => void;
  totalBooks: number;
  filteredCount: number;
}) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">חיפוש</label>
        <div className="relative">
          <input
            type="text"
            placeholder="שם ספר או סופר..."
            value={filters.searchTerm}
            onChange={(e) => onChange('searchTerm', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
          />
          <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          מחיר מקסימלי: <span className="text-green-600">₪{filters.maxPrice}</span>
        </label>
        <input
          type="range"
          min="0"
          max="200"
          step="5"
          value={filters.maxPrice}
          onChange={(e) => onChange('maxPrice', Number(e.target.value))}
          className="w-full accent-green-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
          <span>₪0</span>
          <span>₪200</span>
        </div>
      </div>

      {/* Genre Filter */}
      {genres.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">ז׳אנר</label>
          <div className="space-y-1">
            <button
              onClick={() => onChange('selectedGenre', '')}
              className={`w-full text-right text-sm py-2 px-3 rounded-lg transition-colors ${
                filters.selectedGenre === ''
                  ? 'bg-green-50 text-green-700 font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              כל הז׳אנרים
            </button>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => onChange('selectedGenre', genre)}
                className={`w-full text-right text-sm py-2 px-3 rounded-lg transition-colors ${
                  filters.selectedGenre === genre
                    ? 'bg-green-50 text-green-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 text-center">
        מציג {filteredCount} מתוך {totalBooks} ספרים
      </div>
    </div>
  );
}

export default function BooksStore({ books }: { books: Book[] }) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    maxPrice: 200,
    selectedGenre: '',
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Extract unique genres
  const genres = useMemo(() => {
    const allGenres = books.map(b => b.genre).filter(Boolean) as string[];
    return [...new Set(allGenres)];
  }, [books]);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (book.authorName || '').toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesPrice = book.price <= filters.maxPrice;
      const matchesGenre = filters.selectedGenre ? book.genre === filters.selectedGenre : true;
      return matchesSearch && matchesPrice && matchesGenre;
    });
  }, [books, filters]);

  const hasActiveFilters =
    filters.searchTerm !== '' ||
    filters.maxPrice < 200 ||
    filters.selectedGenre !== '';

  const clearFilters = () =>
    setFilters({ searchTerm: '', maxPrice: 200, selectedGenre: '' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">חנות הספרים שלנו</h1>
        <p className="text-lg sm:text-xl text-gray-500 font-medium">
          גלה ספרים שנכתבו על ידי סופרים ישראלים עצמאיים. תמוך ישירות ביוצר.
        </p>
      </div>

      {/* Mobile: sticky search bar + filter button */}
      <div className="lg:hidden mb-6 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="חיפוש ספר או סופר..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-sm"
          />
          <Search size={17} className="absolute right-3 top-3.5 text-gray-400" />
        </div>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className={`relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold shadow-sm border transition-colors ${
            hasActiveFilters
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          <SlidersHorizontal size={17} />
          <span className="hidden sm:inline">סינון</span>
          {hasActiveFilters && (
            <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile: Bottom Sheet */}
      {mobileFiltersOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal size={20} className="text-green-600" />
                  סינון ספרים
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              <FilterPanel
                filters={filters}
                genres={genres}
                onChange={handleFilterChange}
                totalBooks={books.length}
                filteredCount={filteredBooks.length}
              />

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                {hasActiveFilters && (
                  <button
                    onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600"
                  >
                    נקה סינונים
                  </button>
                )}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold"
                >
                  הצג {filteredBooks.length} ספרים
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-green-600" />
              סינון ספרים
            </h3>
            <FilterPanel
              filters={filters}
              genres={genres}
              onChange={handleFilterChange}
              totalBooks={books.length}
              filteredCount={filteredBooks.length}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full mt-4 py-2 text-sm text-red-500 hover:text-red-700 font-bold border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
              >
                נקה סינונים
              </button>
            )}
          </div>
        </div>

        {/* Books Grid */}
        <div className="flex-1">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">לא נמצאו ספרים</h3>
              <p className="text-gray-500 font-medium mb-6">נסה לשנות את מסנני החיפוש או המחיר.</p>
              <button
                onClick={clearFilters}
                className="text-green-600 font-bold hover:underline"
              >
                נקה סינונים
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                >
                  {/* Cover */}
                  <div className="aspect-[2/3] w-full bg-gray-50 relative overflow-hidden">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <BookOpen size={40} className="mb-2 opacity-50" />
                        <span className="text-xs font-medium">אין כריכה</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold text-gray-900 shadow-sm">
                      ₪{book.price}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-5">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-0.5 group-hover:text-green-600 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium truncate mb-3">
                      מאת: {book.authorName}
                    </p>
                    <div className="pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{book.salesCount} נמכרו</span>
                      <span className="text-green-600 font-bold text-xs sm:text-sm flex items-center gap-1">
                        לרכישה
                        <ChevronRight size={14} className="transform rotate-180" />
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
