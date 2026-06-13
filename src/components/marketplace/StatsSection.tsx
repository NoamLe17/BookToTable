'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, Heart } from 'lucide-react';

const stats = [
  { id: 1, name: 'ספרים זמינים', value: '1,200+', icon: BookOpen },
  { id: 2, name: 'סופרים פעילים', value: '350+', icon: Users },
  { id: 3, name: 'קוראים מרוצים', value: '15,000+', icon: Heart },
  { id: 4, name: 'רבי מכר', value: '45', icon: Award },
];

export default function StatsSection() {
  return (
    <section className="py-12 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-50 text-green-600 mb-4 shadow-sm border border-green-100">
                <stat.icon size={28} />
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
