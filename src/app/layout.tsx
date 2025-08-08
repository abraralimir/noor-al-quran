import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Analytics } from "@vercel/analytics/react";

const siteUrl = 'https://noor-al-quran.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Noor Al Quran',
    template: '%s | Noor Al Quran',
  },
  description: 'Your digital gateway to the Holy Quran. Read, listen, and learn with an intuitive and serene experience designed for reflection and study.',
  icons: {
    icon: '/book-1920.jpg',
    apple: '/book-1920.jpg',
  },
  openGraph: {
    title: 'Noor Al Quran',
    description: 'Your digital gateway to the Holy Quran. Read, listen, and learn with an intuitive and serene experience designed for reflection and study.',
    url: siteUrl,
    siteName: 'Noor Al Quran',
    images: [
      {
        url: `${siteUrl}/book-1920.jpg`,
        width: 1920,
        height: 1280,
        alt: 'The Holy Quran on a stand.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noor Al Quran',
    description: 'Your digital gateway to the Holy Quran. Read, listen, and learn with an intuitive and serene experience designed for reflection and study.',
    images: [`${siteUrl}/book-1920.jpg`],
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
