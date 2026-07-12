import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { useOtpLoginContext } from './OtpLoginProvider';

export const NameStepForm = () => {
  const { t } = useTranslation();
  const { submitName, savingName, nameError } = useOtpLoginContext();
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(submitName(name.trim()));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        label={t('auth.name.label')}
        placeholder={t('auth.name.placeholder')}
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={localError ?? nameError ?? undefined}
      />
      <Button type="submit" loading={savingName} className="w-full">
        {t('auth.name.submit')}
      </Button>
    </form>
  );
};
