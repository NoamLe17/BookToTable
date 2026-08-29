import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/contexts/CartContext';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-heebo',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.booktotable.com'),
  title: 'סיפור קרוב | Book To Table — פלטפורמת ספרים ישירות מהסופר לקורא',
  description:
    'סיפור קרוב (Book To Table) — הפלטפורמה הראשונה בישראל לספרים ישירות מהסופר לקורא. ללא עמלות, ללא מתווכים. הסופר מרוויח 100% מכל מכירה.',
  keywords: 'סיפור קרוב, Book To Table, BookToTable, ספרים ישירות מהסופר, סופרים עצמאיים ישראל, פלטפורמת ספרים, מכירת ספרים, ספרים ישראלים, קניית ספרים ישראל, ספרים בלי מתווכים, מהסופר לשולחן הקריאה, חנות ספרים ישראל',
  verification: {
    google: 'google08a49ad78361bdba',
  },
  alternates: {
    canonical: 'https://www.booktotable.com',
  },
  openGraph: {
    title: 'סיפור קרוב | Book To Table — ספרים ישירות מהסופר לקורא',
    description: 'סיפור קרוב — הפלטפורמה הישראלית הראשונה לספרים ישירות מהסופר לקורא. ללא עמלות, ללא מתווכים. 100% לסופר.',
    url: 'https://www.booktotable.com',
    siteName: 'סיפור קרוב | Book To Table',
    locale: 'he_IL',
    type: 'website',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'סיפור קרוב — Book To Table — ספרים ישירות מהסופר' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'סיפור קרוב | Book To Table — ספרים ישירות מהסופר',
    description: 'סיפור קרוב — הפלטפורמה הישראלית לספרים ישירות מהסופר לקורא. ללא עמלות, ללא מתווכים.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="bg-gray-50 text-gray-900 font-heebo antialiased min-h-screen">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YDYTJNPN5X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
  
            gtag('config', 'G-YDYTJNPN5X');
          `}
        </Script>

        {/* JSON-LD Schemas for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'סיפור קרוב',
                alternateName: ['Book To Table', 'BookToTable'],
                url: 'https://www.booktotable.com',
                logo: 'https://www.booktotable.com/logo.png',
                description: 'סיפור קרוב (Book To Table) — הפלטפורמה הראשונה בישראל שמאפשרת לסופרים עצמאיים למכור ספרים ישירות לקוראים. ללא עמלות, ללא מתווכים.',
                sameAs: [
                  'https://www.booktotable.com',
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'סיפור קרוב',
                alternateName: ['Book To Table', 'BookToTable'],
                url: 'https://www.booktotable.com',
                description: 'פלטפורמת ספרים ישראלית — ספרים ישירות מהסופר לקורא. Book To Table מחברת בין סופרים עצמאיים לקוראים ללא עמלות ומתווכים.',
                inLanguage: 'he',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://www.booktotable.com/books?q={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
            ]),
          }}
        />

        <CartProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#111827',
                border: '1px solid #e5e7eb',
                direction: 'rtl',
              },
            }}
          />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
