import React from 'react';
import { Metadata } from 'next';
import { getBooks } from '@/lib/firestore';
import BooksStore from '@/components/marketplace/BooksStore';

// Always fetch fresh — so newly added/deleted books appear immediately
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'חנות ספרים | סיפור קרוב — Book To Table',
  description: 'גלו ספרים של סופרים ישראלים עצמאיים בסיפור קרוב (Book To Table). קנו ספרים ישירות מהסופר — בלי עמלות ובלי מתווכים. משלוח עד הבית.',
  alternates: {
    canonical: 'https://www.booktotable.com/books',
  },
  openGraph: {
    title: 'חנות ספרים | סיפור קרוב — Book To Table',
    description: 'גלו ספרים של סופרים ישראלים עצמאיים בסיפור קרוב. קנו ישירות מהסופר. Book To Table — ללא עמלות.',
    url: 'https://www.booktotable.com/books',
    type: 'website',
  },
};

export default async function BooksPage() {
  // Fetch only published books, up to 100
  const books = await getBooks(100);

  return (
    <div className="min-h-screen bg-gray-50">
      <BooksStore books={books} />
    </div>
  );
}
