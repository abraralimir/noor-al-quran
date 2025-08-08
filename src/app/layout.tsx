import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noor-al-quran.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Noor Al Quran - Read, Listen, and Learn the Holy Quran',
    template: '%s | Noor Al Quran',
  },
  description: 'Your digital gateway to the Holy Quran. Read, listen, and learn with an intuitive and serene experience designed for reflection and study.',
  manifest: '/manifest.webmanifest',
  keywords: ['Quran', 'Islam', 'Holy Book', 'Recitation', 'Learn Quran', 'Islamic App', 'Noor Al Quran', 'Tafsir', 'Hadith'],
  authors: [{ name: 'Noor Al Quran Team', url: siteUrl }],
  creator: 'Noor Al Quran Team',
  
  // Open Graph (for Facebook, WhatsApp, etc.)
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Noor Al Quran - Read, Listen, and Learn',
    description: 'An intuitive and serene experience designed for reflection and study of the Holy Quran.',
    images: [
      {
        url: '/book-1283468.jpg',
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
    images: [`${siteUrl}/book-1283468.jpg`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#E4ECEB" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1C2D2B" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/book-1283468.jpg" type="image/jpeg" sizes="any" />
        <link rel="apple-touch-icon" href="/book-1283468.jpg" />
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
      </body>
    </html>
  );
}
