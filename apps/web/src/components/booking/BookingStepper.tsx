import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cx } from '@/utils';
import { ROUTES } from '@/config';

const STEPS = [
  { path: ROUTES.book.specialty, labelKey: 'booking.steps.specialty' },
  { path: ROUTES.book.doctor, labelKey: 'booking.steps.doctor' },
  { path: ROUTES.book.slot, labelKey: 'booking.steps.time' },
  { path: ROUTES.book.confirm, labelKey: 'booking.steps.confirm' },
] as const;

const stepDotToneClass = (active: boolean, done: boolean): string => {
  if (active) return 'bg-brand-600 text-white';
  if (done) return 'bg-brand-100 text-brand-700';
  return 'bg-ink-100 text-ink-400';
};

export const BookingStepper = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const activeIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <ol className="flex items-center justify-center gap-1.5 text-sm sm:gap-4">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={step.path} className="flex items-center gap-1 sm:gap-2">
            <span
              className={cx(
                'flex h-2 w-2 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7',
                stepDotToneClass(active, done),
              )}
            >
              <span className="hidden sm:inline">{i + 1}</span>
            </span>
            <span className={cx('hidden sm:inline', active ? 'text-title' : 'text-ink-400')}>
              {t(step.labelKey)}
            </span>
            {i < STEPS.length - 1 && <span className="hidden sm:inline mx-1 text-ink-300">›</span>}
          </li>
        );
      })}
    </ol>
  );
};
