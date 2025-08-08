import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Analytics } from "@vercel/analytics/next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noor-al-quran.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Noor Al Quran - Read, Listen, and Learn the Holy Quran',
    template: '%s | Noor Al Quran',
  },
  description: 'Your digital gateway to the Holy Quran. Read, listen, and learn with an intuitive and serene experience designed for reflection and study.',
  keywords: ['Quran', 'Islam', 'Holy Book', 'Recitation', 'Learn Quran', 'Islamic App', 'Noor Al Quran', 'Tafsir', 'Hadith'],
  authors: [{ name: 'Noor Al Quran Team', url: siteUrl }],
  creator: 'Noor Al Quran Team',
  
  // Open Graph (for Facebook, WhatsApp, etc.)
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Noor Al Quran - Read, Listen, and Learn',
    description: 'An intuitive and serene experience designed for reflection and study of the Holy Quran.',
    images: [
      {
        url: '/book-1283468.jpg', // Using the absolute path from the public directory
        width: 1200,
        height: 630,
        alt: 'The Holy Quran on a decorated stand',
      },
    ],
    siteName: 'Noor Al Quran',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Noor Al Quran - Read, Listen, and Learn',
    description: 'An intuitive and serene experience designed for reflection and study of the Holy Quran.',
    images: ['/book-1283468.jpg'], // Using the absolute path
  },
  
  // Icons
  icons: {
    icon: '/book-1283468.jpg',
    apple: '/book-1283468.jpg',
  },

  // PWA & Theme
  manifest: '/manifest.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F5DC' },
    { media: '(prefers-color-scheme: dark)', color: '#1A2E2B' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Source+Code+Pro:ital,wght@0,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
