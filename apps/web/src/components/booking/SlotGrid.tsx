import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SlotsResponse } from '@cortex/shared';
import { EmptyState, QueryState, SkeletonGrid } from '@/components/ui';
import { cx } from '@/utils';
import { useSlots } from '@/api/queries/catalog';
import { useBookSlot, useSlotDate } from '@/hooks/booking';
import { SlotButton } from './SlotButton';

const SLOTS_GRID_CLASS = 'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6';

export const SlotGrid = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const doctorId = params.get('doctorId') ?? '';
  const rescheduleId = params.get('rescheduleId');
  const { date } = useSlotDate();

  const query = useSlots(doctorId, date);
  const { select, pending } = useBookSlot({ doctorId, date, rescheduleId });

  return (
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
        <div className={cx(SLOTS_GRID_CLASS, query.isFetching && 'opacity-60')}>
          {data.slots.map((slot) => (
            <SlotButton
              key={slot.startsAt}
              startsAt={slot.startsAt}
              disabled={pending}
              onSelect={select}
            />
          ))}
        </div>
      )}
    </QueryState>
  );
};
