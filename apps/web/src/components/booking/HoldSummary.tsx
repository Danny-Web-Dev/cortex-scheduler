import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import { formatFullDateTime } from '@/utils';
import { useConfirmHoldContext } from '@/state/booking';

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <dt className="text-ink-500">{label}</dt>
    <dd className="text-title">{value}</dd>
  </div>
);

export const HoldSummary = () => {
  const { t } = useTranslation();
  const { held } = useConfirmHoldContext();

  return (
    <Card>
      <dl className="space-y-3 text-sm">
        <SummaryRow label={t('booking.confirm.doctor')} value={held.doctorName} />
        <SummaryRow label={t('booking.confirm.specialty')} value={held.specialtyName} />
        <SummaryRow label={t('booking.confirm.when')} value={formatFullDateTime(held.startsAt)} />
        <SummaryRow
          label={t('booking.confirm.durationLabel')}
          value={t('booking.confirm.duration', { durationMin: held.durationMin })}
        />
      </dl>
    </Card>
  );
};
