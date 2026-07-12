import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { formatPhoneInput } from '@/utils';
import { useOtpLoginContext } from '@/state/auth';
import { useStepForm } from '@/hooks/auth';

export const PhoneStepForm = () => {
  const { t } = useTranslation();
  const { submitPhone, requesting, requestError } = useOtpLoginContext();
  const { value: phone, setValue: setPhone, localError, handleSubmit } = useStepForm(submitPhone);

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
