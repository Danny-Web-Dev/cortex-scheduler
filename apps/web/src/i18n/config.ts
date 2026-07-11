import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';

export const DEFAULT_LOCALE = 'en';

// Flat dotted keys ("booking.confirm.duration" is a literal key, not a nesting
// path), so keySeparator/nsSeparator are disabled. Resources are bundled — init
// resolves synchronously, so the returned promise is intentionally ignored.
void i18next.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
});

export { i18next };
