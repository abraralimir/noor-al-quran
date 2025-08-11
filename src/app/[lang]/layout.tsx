
import type { Metadata, ResolvingMetadata } from 'next';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from '@/contexts/LanguageContext';
import en from '@/locales/en.json';
import ur from '@/locales/ur.json';

const translations = { en, ur };
const siteUrl = 'https://noor-al-quran.vercel.app';

type Props = {
  params: { lang: 'en' | 'ur' }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const lang = params.lang || 'en';
  const t = translations[lang];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t.noorAlQuran,
      template: `%s | ${t.noorAlQuran}`,
    },
    description: t.appDescription,
    icons: {
      icon: '/book-1920.jpg',
      apple: '/book-1920.jpg',
    },
    openGraph: {
      title: t.noorAlQuran,
      description: t.appDescription,
      url: `${siteUrl}/${lang}`,
      siteName: t.noorAlQuran,
      images: [
        {
          url: `${siteUrl}/book-1920.jpg`,
          width: 1920,
          height: 1280,
          alt: t.quranImageAlt,
        },
      ],
      locale: lang === 'ur' ? 'ur_PK' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.noorAlQuran,
      description: t.appDescription,
      images: [`${siteUrl}/book-1920.jpg`],
    },
  }
}

export default function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: 'en' | 'ur' }
}>) {
  return (
    <LanguageProvider langParam={params.lang}>
        <div lang={params.lang} dir={params.lang === 'ur' ? 'rtl' : 'ltr'} className="font-body antialiased bg-background text-foreground">
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <Footer />
            </div>
        </div>
    </LanguageProvider>
  );
}
