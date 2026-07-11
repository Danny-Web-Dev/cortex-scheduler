import type en from './en.json';

// Makes the `t` function and <Trans> aware of every key in en.json, so a typo
// or missing key is a compile error. keySeparator:false mirrors the runtime
// config so dotted keys are treated as flat literals at the type level too.
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    keySeparator: false;
    resources: { translation: typeof en };
  }
}
