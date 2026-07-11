import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SlotsResponse } from '@cortex/shared';
import { EmptyState, Input, PageHeading, QueryState, SkeletonGrid, Spinner } from '@/components/ui';
import { formatSlotTime } from '@/lib';
import { useSlots } from './useSlots';
import { useBookSlot } from './useBookSlot';

const SLOTS_GRID_CLASS = 'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6';

const tomorrowIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
};

export const SlotStep = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const doctorId = params.get('doctorId') ?? '';
  const rescheduleId = params.get('rescheduleId');
  const [date, setDate] = useState(tomorrowIso);

  const query = useSlots(doctorId, date);
  const { select, pending } = useBookSlot({ doctorId, date, rescheduleId });

  if (!doctorId) return <Navigate to="/book/specialty" replace />;

  return (
    <div>
      <PageHeading
        title={rescheduleId ? t('booking.slot.titleReschedule') : t('booking.slot.title')}
        subtitle={t('booking.slot.subtitle')}
      />

      <div className="mb-6 max-w-xs">
        <Input
          id="date"
          type="date"
          label={t('booking.slot.dateLabel')}
          value={date}
          min={new Date().toLocaleDateString('en-CA')}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {pending && (
        <div className="mb-4 flex items-center gap-2 text-sm text-brand-600">
          <Spinner size="sm" /> {t('booking.slot.reserving')}
        </div>
      )}

      <QueryState
        query={query}
        skeleton={<SkeletonGrid count={12} itemClassName="h-11" className={SLOTS_GRID_CLASS} />}
        errorMessage={t('booking.slot.error')}
        isEmpty={(data: SlotsResponse) => data.slots.length === 0}
        empty={
          <EmptyState
            title={t('booking.slot.emptyTitle')}
            description={t('booking.slot.emptyDescription')}
          />
        }
      >
        {(data) => (
          <div className={`${SLOTS_GRID_CLASS} ${query.isFetching ? 'opacity-60' : ''}`}>
            {data.slots.map((slot) => (
              <button
                key={slot.startsAt}
                type="button"
                disabled={pending}
                onClick={() => select(slot.startsAt)}
                className="rounded-lg border border-ink-200 bg-white py-2.5 text-sm font-medium text-ink-800 transition hover:border-brand-400 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {formatSlotTime(slot.startsAt)}
              </button>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
};
