import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export const metadata: Metadata = {
  title: 'Noor Al Quran',
  description: 'A beautiful and easy-to-read Quran web app.',
  manifest: '/manifest.webmanifest',
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
        <link rel="icon" href="/book-1283468.jpg" sizes="any" type="image/jpeg" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/book-1283468.jpg" sizes="512x512" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/book-1283468.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
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
