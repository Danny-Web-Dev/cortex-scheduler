import { useTranslation } from 'react-i18next';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-9 w-9 border-[3px]',
};

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  const { t } = useTranslation();

  return (
    <span
      role="status"
      aria-label={t('ui.loading')}
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${SIZES[size]} ${className}`}
    />
  );
};
