import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';

type NameStepFormProps = {
  loading: boolean;
  error?: string | null;
  onSubmit: (name: string) => string | null;
};

export const NameStepForm = ({ loading, error, onSubmit }: NameStepFormProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(onSubmit(name.trim()));
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
        error={localError ?? error ?? undefined}
      />
      <Button type="submit" loading={loading} className="w-full">
        {t('auth.name.submit')}
      </Button>
    </form>
  );
};
