import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../../i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || 'fr').slice(0, 2);
  return (
    <div className="flex items-center gap-1 text-xs tracking-wide">
      {SUPPORTED_LOCALES.map((lng) => (
        <button key={lng} onClick={() => i18n.changeLanguage(lng)}
          className={`rounded px-2 py-1 uppercase transition ${
            current === lng ? 'font-semibold text-ink' : 'text-slate-ardoise hover:text-ink'
          }`}>{lng}</button>
      ))}
    </div>
  );
}
