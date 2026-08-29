/**
 * POST /api/indexing/notify
 * 
 * Called automatically when a book is published.
 * Notifies Google Indexing API to crawl the new book page immediately.
 * 
 * Body: { url: string, type?: 'URL_UPDATED' | 'URL_DELETED' }
 */

import { NextResponse } from 'next/server';
import { notifyGoogleIndexing, pingSitemapToSearchEngines } from '@/lib/google-indexing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, type = 'URL_UPDATED' } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid url' }, { status: 400 });
    }

    // Validate URL is from our domain
    if (!url.startsWith('https://www.booktotable.com')) {
      return NextResponse.json({ error: 'URL must be from booktotable.com' }, { status: 400 });
    }

    // 1. Notify Google Indexing API for the specific URL
    const indexingResult = await notifyGoogleIndexing(url, type);

    // 2. Also ping Google + Bing with updated sitemap
    await pingSitemapToSearchEngines();

    return NextResponse.json({
      success: indexingResult.success,
      url,
      type,
      message: indexingResult.success
        ? `✅ Google notified to index: ${url}`
        : `⚠️ Indexing notification failed: ${indexingResult.message}`,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/indexing/notify] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
