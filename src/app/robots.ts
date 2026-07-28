import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/',
        '/checkout/',
        '/cart/',
        '/auth/register',
      ],
    },
    sitemap: 'https://www.booktotable.com/sitemap.xml',
  };
}
