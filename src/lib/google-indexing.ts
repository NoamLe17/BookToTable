/**
 * Google Indexing API Utility
 * Notifies Google immediately when a page is published/updated.
 * Uses service account authentication via JWT.
 * 
 * Docs: https://developers.google.com/search/apis/indexing-api/v3/quickstart
 */

const GOOGLE_INDEXING_API_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const GOOGLE_AUTH_ENDPOINT = 'https://oauth2.googleapis.com/token';

/**
 * Create a signed JWT for Google API authentication
 */
async function createGoogleJWT(): Promise<string> {
  const serviceAccountEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Missing Google Indexing API credentials (GOOGLE_INDEXING_CLIENT_EMAIL or GOOGLE_INDEXING_PRIVATE_KEY)');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccountEmail,
    sub: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: GOOGLE_AUTH_ENDPOINT,
    iat: now,
    exp: now + 3600,
  };

  const base64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

  const headerB64 = base64url(header);
  const payloadB64 = base64url(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  // Use Node.js crypto to sign with RS256
  const { createSign } = await import('crypto');
  const sign = createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign(privateKey, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${signingInput}.${signature}`;
}

/**
 * Get an OAuth2 access token using the service account JWT
 */
async function getAccessToken(): Promise<string> {
  const jwt = await createGoogleJWT();

  const response = await fetch(GOOGLE_AUTH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Google access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Notify Google to index/update a URL immediately.
 * Type: 'URL_UPDATED' for new/updated pages, 'URL_DELETED' for removed pages.
 */
export async function notifyGoogleIndexing(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ success: boolean; message: string }> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(GOOGLE_INDEXING_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ url, type }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Google Indexing] Failed for ${url}:`, error);
      return { success: false, message: error };
    }

    const data = await response.json();
    console.log(`[Google Indexing] ✅ Successfully notified for ${url}`);
    return { success: true, message: JSON.stringify(data) };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Google Indexing] Error for ${url}:`, message);
    return { success: false, message };
  }
}

/**
 * Notify Google to index multiple URLs (e.g., all published books)
 */
export async function notifyGoogleIndexingBatch(
  urls: string[],
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ url: string; success: boolean; message: string }[]> {
  const results = [];
  for (const url of urls) {
    const result = await notifyGoogleIndexing(url, type);
    results.push({ url, ...result });
    // Small delay to avoid rate limiting (200 URLs/day limit)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return results;
}

/**
 * Ping search engines with updated sitemap URL
 */
export async function pingSitemapToSearchEngines(
  sitemapUrl = 'https://www.booktotable.com/sitemap.xml'
): Promise<void> {
  const pings = [
    // Google
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    // Bing
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  await Promise.allSettled(
    pings.map(url =>
      fetch(url).then(() => console.log(`[Sitemap Ping] ✅ Pinged: ${url}`))
    )
  );
}
