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
  title: 'Book To Table | מהסופר לשולחן הקריאה',
  description:
    'Book To Table – הפלטפורמה הראשונה בישראל שמאפשרת לסופרים עצמאיים למכור ספרים ישירות לקוראים. ללא עמלות, ללא מתווכים — מהסופר לשולחן הקריאה.',
  keywords: 'ספרים, סופרים עצמאיים, Book To Table, BookToTable, מהסופר לשולחן הקריאה, מכירת ספרים, ישראל, ספרים ישראלים',
  openGraph: {
    title: 'Book To Table | מהסופר לשולחן הקריאה',
    description: 'מכור את ספרך ישירות לקוראים — ללא עמלות, ללא מתווכים.',
    locale: 'he_IL',
    type: 'website',
    images: [{ url: '/logo.png' }],
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
