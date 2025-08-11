
'use client';
import { useTranslation } from '@/hooks/use-translation';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          © {new Date().getFullYear()} {t('noorAlQuran')}. {t('allRightsReserved')}.
        </p>
      </div>
    </footer>
  );
}
