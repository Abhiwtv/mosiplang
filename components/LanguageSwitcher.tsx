'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    if (newLocale === 'en') {
      const cleanPath = pathname.replace(/^\/(hi|de)/, '') || '/';
      router.push(cleanPath);
    } else {
      const cleanPath = pathname.replace(/^\/(hi|de|en)/, '') || '/';
      router.push(`/${newLocale}${cleanPath}`);
    }
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <div className="relative group">
      <button 
        type="button"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <span className="sm:hidden">{currentLanguage?.flag}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((language) => (
          <button
            key={language.code}
            type="button"
            onClick={() => switchLocale(language.code)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
              locale === language.code 
                ? 'bg-emerald-50 font-semibold text-emerald-700' 
                : 'text-slate-700'
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </button>
        ))}
      </div>
    </div>
  );
}