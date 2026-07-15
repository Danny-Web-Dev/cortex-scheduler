import type en from './en.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    keySeparator: false;
    resources: { translation: typeof en };
  }
}
