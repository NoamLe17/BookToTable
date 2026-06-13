'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden hero-bg pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
              <span className="block mb-2">חיבור ישיר בין</span>
              <span className="gradient-text">סופרים לקוראים</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
              הפלטפורמה המהפכנית שמאפשרת לסופרים למכור ישירות לקוראים, 
              לשמור על רוב ההכנסות ולבנות קהילה אמיתית.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#books" 
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all text-lg flex items-center justify-center gap-2"
              >
                <BookOpen size={20} />
                <span>גלה ספרים</span>
              </Link>
              <Link 
                href="/authors/join" 
                className="bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 font-bold py-3 px-8 rounded-full shadow-sm transition-all text-lg flex items-center justify-center gap-2"
              >
                <TrendingUp size={20} className="text-green-600" />
                <span>הצטרף כסופר</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
