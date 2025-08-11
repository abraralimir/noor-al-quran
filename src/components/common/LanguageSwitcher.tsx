'use client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: 'en' | 'ur') => {
    setLanguage(lang);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Language</h3>
      <RadioGroup
        value={language}
        onValueChange={handleLanguageChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="en" id="lang-en" />
          <Label htmlFor="lang-en">English</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ur" id="lang-ur" />
          <Label htmlFor="lang-ur">Urdu (اردو)</Label>
        </div>
      </RadioGroup>
      <p className="text-sm text-muted-foreground">
        Changes will be applied automatically. You may need to refresh the page to see all changes.
      </p>
    </div>
  );
}
