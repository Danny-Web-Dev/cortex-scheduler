import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui';
import { useSlotDate } from './useSlotDate';

export const SlotDatePicker = () => {
  const { t } = useTranslation();
  const { date, setDate } = useSlotDate();

  return (
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
  );
};
