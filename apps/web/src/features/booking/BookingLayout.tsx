import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import type { Appointment } from '@cortex/shared';
import { BookingContext } from './booking-context';

const STEPS = [
  { path: '/book/specialty', label: 'Specialty' },
  { path: '/book/doctor', label: 'Doctor' },
  { path: '/book/slot', label: 'Time' },
  { path: '/book/confirm', label: 'Confirm' },
];

export const BookingLayout = () => {
  const [heldAppointment, setHeldAppointment] = useState<Appointment | null>(null);
  const { pathname } = useLocation();
  const activeIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <BookingContext.Provider value={{ heldAppointment, setHeldAppointment }}>
      <div className="space-y-8">
        <ol className="flex items-center justify-center gap-4 text-sm">
          {STEPS.map((step, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <li key={step.path} className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    active
                      ? 'bg-brand-600 text-white'
                      : done
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-ink-100 text-ink-400'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={active ? 'font-semibold text-ink-900' : 'text-ink-400'}>
                  {step.label}
                </span>
                {i < STEPS.length - 1 && <span className="mx-1 text-ink-300">›</span>}
              </li>
            );
          })}
        </ol>
        <Outlet />
      </div>
    </BookingContext.Provider>
  );
};
