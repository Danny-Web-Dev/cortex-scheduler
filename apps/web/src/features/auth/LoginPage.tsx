import { useState, type FormEvent } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { formatPhoneInput } from '@/lib';
import { useOtpLogin } from './useOtpLogin';

export const LoginPage = () => {
  const login = useOtpLogin();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const onPhoneSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(login.submitPhone(phone.trim()));
  };

  const onCodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(login.submitCode(code.trim()));
  };

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-700">Cortex</h1>
          <p className="mt-1 text-sm text-ink-500">
            {login.step === 'phone'
              ? 'Sign in with your phone number'
              : `Enter the code sent to ${login.phone}`}
          </p>
        </div>

        {login.step === 'phone' && (
          <form onSubmit={onPhoneSubmit} className="space-y-4">
            <Input
              id="phone"
              label="Phone number"
              placeholder="054-1234567"
              inputMode="tel"
              autoFocus
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              error={localError ?? login.requestError ?? undefined}
            />
            <Button type="submit" loading={login.requesting} className="w-full">
              Send code
            </Button>
          </form>
        )}

        {login.step === 'code' && (
          <form onSubmit={onCodeSubmit} className="space-y-4">
            {login.devCode && (
              <div className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-center text-sm text-brand-800">
                Dev code: <span className="font-mono font-bold">{login.devCode}</span>
              </div>
            )}
            <Input
              id="code"
              label="Verification code"
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              error={localError ?? login.verifyError ?? undefined}
            />
            <Button type="submit" loading={login.verifying} className="w-full">
              Verify &amp; sign in
            </Button>
            <button
              type="button"
              onClick={login.resetToPhone}
              className="w-full text-sm text-ink-500 hover:text-ink-700"
            >
              Use a different number
            </button>
          </form>
        )}
      </Card>
    </div>
  );
};
