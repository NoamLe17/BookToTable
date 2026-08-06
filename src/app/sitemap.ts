import { MetadataRoute } from 'next';

// Fetch published books for sitemap using Firebase Admin SDK
async function getPublishedBookIds(): Promise<{ id: string; updatedAt: Date }[]> {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');

    const snap = await adminDb
      .collection('books')
      .where('isPublished', '==', true)
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      updatedAt: doc.updateTime?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Sitemap: Failed to fetch books from Firestore:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bookIds = await getPublishedBookIds();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://www.booktotable.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.booktotable.com/books',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.booktotable.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.booktotable.com/auth/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://www.booktotable.com/legal',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.booktotable.com/accessibility',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.booktotable.com/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const bookRoutes: MetadataRoute.Sitemap = bookIds.map(({ id, updatedAt }) => ({
    url: `https://www.booktotable.com/books/${id}`,
    lastModified: updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...bookRoutes];
}

