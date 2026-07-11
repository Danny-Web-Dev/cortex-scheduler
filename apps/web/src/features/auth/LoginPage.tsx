import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import { useOtpLogin } from './useOtpLogin';
import { PhoneStepForm } from './PhoneStepForm';
import { CodeStepForm } from './CodeStepForm';
import { NameStepForm } from './NameStepForm';

export const LoginPage = () => {
  const { t } = useTranslation();
  const login = useOtpLogin();

  const subtitleByStep: Record<typeof login.step, string> = {
    phone: t('auth.phone.subtitle'),
    code: t('auth.code.subtitle', { phone: login.phone }),
    name: t('auth.name.subtitle'),
  };

  return (
    <div className="center-viewport px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-700">{t('app.brand')}</h1>
          <p className="mt-1 text-subtitle">{subtitleByStep[login.step]}</p>
        </div>

        {login.step === 'phone' && (
          <PhoneStepForm
            loading={login.requesting}
            error={login.requestError}
            onSubmit={login.submitPhone}
          />
        )}

        {login.step === 'code' && (
          <CodeStepForm
            devCode={login.devCode}
            loading={login.verifying}
            error={login.verifyError}
            onSubmit={login.submitCode}
            onUseDifferentNumber={login.resetToPhone}
          />
        )}

        {login.step === 'name' && (
          <NameStepForm
            loading={login.savingName}
            error={login.nameError}
            onSubmit={login.submitName}
          />
        )}
      </Card>
    </div>
  );
};
