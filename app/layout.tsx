import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resmiin Admin — CMS Dashboard',
  description: 'Dashboard Admin Resmiin — Kelola artikel, SEO, media, dan konten website.',
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
