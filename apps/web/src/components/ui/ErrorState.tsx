import { useTranslation } from 'react-i18next';
import { resolveErrorMessage } from '@/utils';
import { Button } from './Button';

type ErrorStateProps = {
  message?: string;
  error?: unknown;
  onRetry?: () => void;
};

export const ErrorState = ({ message, error, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="surface-error">
      <p className="text-sm font-medium text-red-700">{resolveErrorMessage(error, t, message)}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t('ui.error.retry')}
        </Button>
      )}
    </div>
  );
};
