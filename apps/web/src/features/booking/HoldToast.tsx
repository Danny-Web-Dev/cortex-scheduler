import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useHoldToast } from './useHoldToast';

export const HoldToast = () => {
  const { t } = useTranslation();
  const { visible, label } = useHoldToast();

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 shadow-md"
      >
        <p className="text-sm font-medium text-amber-800">
          <Trans i18nKey="booking.holdToast.message" values={{ label }}>
            Slot still held for <span className="font-mono font-bold" />
          </Trans>
        </p>
        <Link
          to="/book/confirm"
          className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          {t('booking.holdToast.cta')}
        </Link>
      </div>
    </div>
  );
};
