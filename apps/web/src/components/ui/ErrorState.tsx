import { useTranslation } from 'react-i18next';
import { Button } from './Button';

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-sm font-medium text-red-700">{message ?? t('ui.error.default')}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t('ui.error.retry')}
        </Button>
      )}
    </div>
  );
};
