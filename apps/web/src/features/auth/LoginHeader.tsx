import { useTranslation } from 'react-i18next';
import { useOtpLoginContext } from './OtpLoginProvider';

export const LoginHeader = () => {
  const { t } = useTranslation();
  const { step, phone } = useOtpLoginContext();

  const subtitleByStep: Record<typeof step, string> = {
    phone: t('auth.phone.subtitle'),
    code: t('auth.code.subtitle', { phone }),
    name: t('auth.name.subtitle'),
  };

  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-bold text-brand-700">{t('app.brand')}</h1>
      <p className="mt-1 text-subtitle">{subtitleByStep[step]}</p>
    </div>
  );
};
