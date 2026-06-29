import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // Adjust if you have paths you don't want Google to index
    },
    sitemap: 'https://booktotable.com/sitemap.xml',
  };
}
