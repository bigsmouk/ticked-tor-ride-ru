import { useLanguage } from '@/i18n/language';
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return <div className="inline-flex items-center gap-1 rounded-lg border border-amber-500/70 bg-slate-900/85 p-1 shadow-lg" role="group" aria-label="Language / Язык">
    {(['ru','en'] as const).map(lang => <button key={lang} type="button" lang={lang}
      aria-pressed={language === lang} onClick={() => setLanguage(lang)}
      className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${language === lang ? 'bg-amber-400 text-slate-950' : 'text-white hover:bg-white/20'}`}>
      {lang.toUpperCase()}
    </button>)}
  </div>;
}
