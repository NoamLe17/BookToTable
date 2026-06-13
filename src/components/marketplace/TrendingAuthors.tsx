'use client';

import React from 'react';
import { User } from '@/types';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface TrendingAuthorsProps {
  authors: User[];
}

export default function TrendingAuthors({ authors }: TrendingAuthorsProps) {
  if (!authors || authors.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Star className="text-yellow-400" fill="currentColor" />
            <span className="text-gray-900">סופרים בולטים</span>
            <Star className="text-yellow-400" fill="currentColor" />
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">
            הכירו את היוצרים המובילים בפלטפורמה שלנו ותמכו ביצירה מקורית וישירה
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author, index) => (
            <motion.div
              key={author.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/authors/${author.id}`}>
                <div className="bg-white rounded-2xl p-6 text-center card-hover border border-gray-200 shadow-sm h-full flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-green-50 p-1 shadow-sm">
                    {author.avatarUrl ? (
                      <img 
                        src={author.avatarUrl} 
                        alt={author.name} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
                        {author.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{author.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow font-medium">
                    {author.bio || 'סופר פעיל בפלטפורמת BookToTable.'}
                  </p>
                  <div className="w-full pt-4 border-t border-gray-100 text-green-600 text-sm font-bold hover:text-green-700 transition-colors">
                    צפה בעמוד הסופר &larr;
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
