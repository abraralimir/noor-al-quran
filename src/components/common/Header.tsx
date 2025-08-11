
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Headphones, MessageCircle, ToyBrick } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AiSearch } from './AiSearch';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { t, language } = useTranslation();

  const navLinks = [
    { href: `/${language}/read`, label: t('read'), icon: BookOpen },
    { href: `/${language}/listen`, label: t('listen'), icon: Headphones },
    { href: `/${language}/tutor`, label: t('tutor'), icon: MessageCircle },
    { href: `/${language}/kids`, label: t('kids'), icon: ToyBrick },
  ];
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href={`/${language}`} className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 4.5c-2.29 0-4.4.6-6.17 1.67l1.41 1.41C8.61 6.78 10.24 6.5 12 6.5s3.39.28 4.76 1.08l1.41-1.41C16.4 5.1 14.29 4.5 12 4.5z"/>
            </svg>
            <span className="font-bold font-headline text-lg">{t('noorAlQuran')}</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                'transition-colors hover:text-primary flex items-center gap-2',
                pathname === href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {mounted && <AiSearch />}
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
