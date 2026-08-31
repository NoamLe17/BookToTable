import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'התחברות | סיפור קרוב — BookToTable',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
