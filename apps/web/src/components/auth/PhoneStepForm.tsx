import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { formatPhoneInput } from '@/utils';
import { useOtpLoginContext } from '@/state/auth';

export const PhoneStepForm = () => {
  const { t } = useTranslation();
  const { submitPhone, requesting, requestError } = useOtpLoginContext();
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(submitPhone(phone.trim()));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="phone"
        label={t('auth.phone.label')}
        placeholder={t('auth.phone.placeholder')}
        inputMode="tel"
        autoFocus
        value={phone}
        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
        error={localError ?? requestError ?? undefined}
      />
      <Button type="submit" loading={requesting} className="w-full">
        {t('auth.phone.submit')}
      </Button>
    </form>
  );
};
