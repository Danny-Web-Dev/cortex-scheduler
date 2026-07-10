import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState, Skeleton, Spinner } from '@/components/ui';
import { formatSlotTime } from '@/lib';
import { useSlots } from './useSlots';
import { useBookSlot } from './useBookSlot';

const tomorrowIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
};

export const SlotStep = () => {
  const [params] = useSearchParams();
  const doctorId = params.get('doctorId') ?? '';
  const rescheduleId = params.get('rescheduleId');
  const [date, setDate] = useState(tomorrowIso);

  const { data, isPending, isFetching, isError, refetch } = useSlots(doctorId, date);
  const { select, pending } = useBookSlot({ doctorId, date, rescheduleId });

  if (!doctorId) return <Navigate to="/book/specialty" replace />;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">
        {rescheduleId ? 'Pick a new time' : 'Pick a time'}
      </h1>
      <p className="mb-6 text-sm text-ink-500">Times shown in your local timezone.</p>

      <label htmlFor="date" className="mb-6 block max-w-xs">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Date</span>
        <input
          id="date"
          type="date"
          value={date}
          min={new Date().toLocaleDateString('en-CA')}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </label>

      {pending && (
        <div className="mb-4 flex items-center gap-2 text-sm text-brand-600">
          <Spinner size="sm" /> Reserving your slot…
        </div>
      )}

      {isPending && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      )}
      {isError && <ErrorState message="Could not load times." onRetry={() => refetch()} />}
      {data && data.slots.length === 0 && (
        <EmptyState
          title="No open times on this day"
          description="Try another date — doctors are available on weekdays."
        />
      )}
      {data && data.slots.length > 0 && (
        <div
          className={`grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 ${isFetching ? 'opacity-60' : ''}`}
        >
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
    </div>
  );
};
