import { formatSlotTime } from '@/utils';

type SlotButtonProps = {
  startsAt: string;
  disabled: boolean;
  onSelect: (startsAt: string) => void;
};

export const SlotButton = ({ startsAt, disabled, onSelect }: SlotButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onSelect(startsAt)}
    className="surface-bordered py-2.5 text-sm font-medium text-ink-800 transition hover:border-brand-400 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {formatSlotTime(startsAt)}
  </button>
);
