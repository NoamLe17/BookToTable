'use client';

import React, { useRef } from 'react';
import { Book } from '@/types';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

interface BookCarouselProps {
  title: string;
  subtitle?: string;
  books: Book[];
  emoji?: string;
}

export default function BookCarousel({ title, subtitle, books, emoji }: BookCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!books || books.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        
        {/* Centered Steimatzky-style Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-green-800">
            {title}
          </h2>
        </div>

        <div 
          ref={carouselRef}
          className="flex flex-wrap justify-center gap-x-6 gap-y-12"
        >
          {books.slice(0, 6).map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="w-[180px] flex flex-col items-center text-center group cursor-pointer"
            >
              <Link href={`/books/${book.id}`} className="w-full">
                {/* Book Cover */}
                <div className="w-full h-[260px] bg-gray-100 mb-4 overflow-hidden relative shadow-md group-hover:shadow-xl transition-shadow duration-300">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <BookOpen size={48} className="text-gray-300" />
                    </div>
                  )}
                  {/* Format icon overlay */}
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded-full w-8 h-8 flex items-center justify-center shadow">
                    <BookOpen size={14} className="text-gray-700" />
                  </div>
                </div>
                
                {/* Book Details */}
                <h3 className="text-base font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{book.authorName}</p>
                
                {/* Price & Format */}
                <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-gray-900">
                  <BookOpen size={16} className="text-gray-400" />
                  <span>מודפס</span>
                </div>
                <div className="text-lg font-black text-gray-900 mt-1">
                  {book.price.toFixed(2)} ₪
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
