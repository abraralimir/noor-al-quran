
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from '@/contexts/LanguageContext';

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
          <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Source+Code+Pro:ital,wght@0,200..900;1,400..900&family=Noto+Naskh+Arabic:wght@400..700&display=swap" rel="stylesheet" />
        </head>
      <body>
          <LanguageProvider>
              {children}
              <Toaster />
              <Analytics />
          </LanguageProvider>
      </body>
    </html>
  );
}
