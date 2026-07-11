import { Card } from '@/components/ui';
import { useOtpLogin } from './useOtpLogin';
import { PhoneStepForm } from './PhoneStepForm';
import { CodeStepForm } from './CodeStepForm';
import { NameStepForm } from './NameStepForm';

export const LoginPage = () => {
  const login = useOtpLogin();

  const subtitleByStep: Record<typeof login.step, string> = {
    phone: 'Sign in with your phone number',
    code: `Enter the code sent to ${login.phone}`,
    name: 'Welcome to Cortex! Tell us your name to finish signing up',
  };

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-700">Cortex</h1>
          <p className="mt-1 text-sm text-ink-500">{subtitleByStep[login.step]}</p>
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
