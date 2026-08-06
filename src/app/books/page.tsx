import React from 'react';
import { Metadata } from 'next';
import { getBooks } from '@/lib/firestore';
import BooksStore from '@/components/marketplace/BooksStore';

export const metadata: Metadata = {
  title: 'חנות ספרים | סיפור קרוב — BookToTable',
  description: 'גלו ספרים של סופרים ישראלים עצמאיים בסיפור קרוב. קנו ספרים ישירות מהסופר — בלי עמלות ובלי מתווכים. משלוח עד הבית.',
  alternates: {
    canonical: 'https://www.booktotable.com/books',
  },
  openGraph: {
    title: 'חנות ספרים | סיפור קרוב — BookToTable',
    description: 'גלו ספרים של סופרים ישראלים עצמאיים בסיפור קרוב. קנו ישירות מהסופר.',
    url: 'https://www.booktotable.com/books',
    type: 'website',
  },
};


export default async function BooksPage() {
  // Fetch up to 100 books for the store
  const books = await getBooks(100);

  return (
    <div className="min-h-screen bg-gray-50">
      <BooksStore books={books} />
    </div>
  );
}
