import type { Specialty } from '@cortex/shared';
import { Card } from '@/components/ui';

type SpecialtyCardProps = {
  specialty: Specialty;
  onSelect?: (specialty: Specialty) => void;
};

export const SpecialtyCard = ({ specialty, onSelect }: SpecialtyCardProps) => (
  <Card interactive={Boolean(onSelect)} onClick={() => onSelect?.(specialty)}>
    <p className="font-semibold text-ink-900">{specialty.name}</p>
    <p className="mt-1 text-sm text-ink-500">{specialty.description}</p>
    <p className="mt-3 text-xs font-medium text-brand-600">~{specialty.avgDurationMin} min visit</p>
  </Card>
);
