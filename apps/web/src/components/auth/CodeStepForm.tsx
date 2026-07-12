import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { useOtpLoginContext } from '@/state/auth';
import { useStepForm } from '@/hooks/auth';
import { DevCodeHint } from './DevCodeHint';

export const CodeStepForm = () => {
  const { t } = useTranslation();
  const { submitCode, verifying, verifyError, resetToPhone } = useOtpLoginContext();
  const { value: code, setValue: setCode, localError, handleSubmit } = useStepForm(submitCode);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DevCodeHint />
      <Input
        id="code"
        label={t('auth.code.label')}
        placeholder={t('auth.code.placeholder')}
        inputMode="numeric"
        maxLength={6}
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value)}
        error={localError ?? verifyError ?? undefined}
      />
      <Button type="submit" loading={verifying} className="w-full">
        {t('auth.code.submit')}
      </Button>
      <button
        type="button"
        onClick={resetToPhone}
        className="w-full text-sm text-ink-500 hover:text-ink-700"
      >
        {t('auth.code.useDifferentNumber')}
      </button>
    </form>
  );
};
