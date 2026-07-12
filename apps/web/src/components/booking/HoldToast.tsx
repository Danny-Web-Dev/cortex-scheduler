import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Toast } from '@/components/ui';
import { ROUTES } from '@/config';
import { useHoldToast } from '@/hooks/booking';

export const HoldToast = () => {
  const { t } = useTranslation();
  const { visible, label } = useHoldToast();

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <Toast
        tone="warning"
        className="pointer-events-auto max-w-md"
        action={
          <Link
            to={ROUTES.book.confirm}
            className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            {t('booking.holdToast.cta')}
          </Link>
        }
      >
        <Trans
          i18nKey="booking.holdToast.message"
          values={{ label }}
          components={{ countdown: <span className="font-mono font-bold" /> }}
        />
      </Toast>
    </div>
  );
};
