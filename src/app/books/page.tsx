import React from 'react';
import { getBooks } from '@/lib/firestore';
import BooksStore from '@/components/marketplace/BooksStore';

export const revalidate = 0; // Fetch fresh data on page load

export default async function BooksPage() {
  // Fetch up to 100 books for the store
  const books = await getBooks(100);

  return (
    <div className="min-h-screen bg-gray-50">
      <BooksStore books={books} />
    </div>
  );
}
