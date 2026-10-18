/**
 * POST /api/indexing/batch
 * 
 * Fetches all published books from Firestore and submits them all to 
 * Google Indexing API in one batch operation.
 * 
 * Also pings Google + Bing with the sitemap.
 * 
 * Protected by CRON_SECRET to prevent unauthorized calls.
 * Can be called manually or by a cron job.
 */

import { NextResponse } from 'next/server';
import { notifyGoogleIndexingBatch, pingSitemapToSearchEngines } from '@/lib/google-indexing';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

const STATIC_URLS = [
  'https://www.booktotable.com',
  'https://www.booktotable.com/books',
  'https://www.booktotable.com/about',
  'https://www.booktotable.com/faq',
];

const ADMIN_EMAIL = 'noamhemo2001@gmail.com';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Allow via CRON_SECRET header OR via admin idToken in body
  let authorized = false;

  // Clone request so we can read body multiple times
  const clonedRequest = request.clone();
  let bodyIdToken: string | undefined;
  try {
    const body = await clonedRequest.json();
    bodyIdToken = body?.idToken;
  } catch { /* no body */ }

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    authorized = true;
  } else if (bodyIdToken) {
    // Verify admin idToken
    try {
      const { getAdminAuth } = await import('@/lib/firebase-admin');
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifyIdToken(bodyIdToken);
      if (decoded.email === ADMIN_EMAIL) authorized = true;
    } catch { /* invalid token */ }
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all published book IDs from Firestore
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const adminDb = getAdminDb();
    const snap = await adminDb
      .collection('books')
      .where('isPublished', '==', true)
      .get();

    const bookUrls = snap.docs.map(
      (doc: QueryDocumentSnapshot) => `https://www.booktotable.com/books/${doc.id}`
    );

    const allUrls = [...STATIC_URLS, ...bookUrls];

    console.log(`[Batch Indexing] Submitting ${allUrls.length} URLs to Google...`);

    // Submit all to Google Indexing API
    const results = await notifyGoogleIndexingBatch(allUrls);

    // Also ping sitemaps
    await pingSitemapToSearchEngines();

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      total: allUrls.length,
      succeeded,
      failed,
      results,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/indexing/batch] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
