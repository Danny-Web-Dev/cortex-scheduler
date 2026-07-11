import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Appointment } from '@cortex/shared';
import { BookingContext } from './booking-context';

const STEPS = [
  { path: '/book/specialty', labelKey: 'booking.steps.specialty' },
  { path: '/book/doctor', labelKey: 'booking.steps.doctor' },
  { path: '/book/slot', labelKey: 'booking.steps.time' },
  { path: '/book/confirm', labelKey: 'booking.steps.confirm' },
] as const;

export const BookingLayout = () => {
  const { t } = useTranslation();
  const [heldAppointment, setHeldAppointment] = useState<Appointment | null>(null);
  const { pathname } = useLocation();
  const activeIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <BookingContext.Provider value={{ heldAppointment, setHeldAppointment }}>
      <div className="space-y-8">
        <ol className="flex items-center justify-center gap-1.5 text-sm sm:gap-4">
          {STEPS.map((step, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <li key={step.path} className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`flex h-2 w-2 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 ${
                    active
                      ? 'bg-brand-600 text-white'
                      : done
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-ink-100 text-ink-400'
                  }`}
                >
                  <span className="hidden sm:inline">{i + 1}</span>
                </span>
                <span
                  className={`hidden sm:inline ${active ? 'font-semibold text-ink-900' : 'text-ink-400'}`}
                >
                  {t(step.labelKey)}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="hidden sm:inline mx-1 text-ink-300">›</span>
                )}
              </li>
            );
          })}
        </ol>
        <Outlet />
      </div>
    </BookingContext.Provider>
  );
};
