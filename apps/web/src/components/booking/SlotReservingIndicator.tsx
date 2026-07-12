import { useIsMutating } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui';
import { mutationKeys } from '@/config';

export const SlotReservingIndicator = () => {
  const { t } = useTranslation();
  const reserving = useIsMutating({ mutationKey: mutationKeys.bookSlot }) > 0;

  if (!reserving) return null;
  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-brand-600">
      <Spinner size="sm" /> {t('booking.slot.reserving')}
    </div>
  );
};
