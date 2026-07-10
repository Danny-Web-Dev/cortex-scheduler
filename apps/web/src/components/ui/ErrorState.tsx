import { Button } from './Button';

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export const ErrorState = ({ message = 'Something went wrong.', onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-red-200 bg-red-50 px-6 py-8 text-center">
    <p className="text-sm font-medium text-red-700">{message}</p>
    {onRetry && (
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
