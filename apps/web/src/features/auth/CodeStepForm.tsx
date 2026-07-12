import { useState, type FormEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Callout, Input } from '@/components/ui';

type CodeStepFormProps = {
  devCode: string | null;
  loading: boolean;
  error?: string | null;
  onSubmit: (code: string) => string | null;
  onUseDifferentNumber: () => void;
};

export const CodeStepForm = ({
  devCode,
  loading,
  error,
  onSubmit,
  onUseDifferentNumber,
}: CodeStepFormProps) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(onSubmit(code.trim()));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {devCode && (
        <Callout tone="brand" className="px-3 py-2">
          <Trans
            i18nKey="auth.code.devCode"
            values={{ code: devCode }}
            components={{ code: <span className="font-mono font-bold" /> }}
          />
        </Callout>
      )}
      <Input
        id="code"
        label={t('auth.code.label')}
        placeholder={t('auth.code.placeholder')}
        inputMode="numeric"
        maxLength={6}
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value)}
        error={localError ?? error ?? undefined}
      />
      <Button type="submit" loading={loading} className="w-full">
        {t('auth.code.submit')}
      </Button>
      <button
        type="button"
        onClick={onUseDifferentNumber}
        className="w-full text-sm text-ink-500 hover:text-ink-700"
      >
        {t('auth.code.useDifferentNumber')}
      </button>
    </form>
  );
};
