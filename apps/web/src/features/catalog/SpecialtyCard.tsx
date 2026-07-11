import { useTranslation } from 'react-i18next';
import type { Specialty } from '@cortex/shared';
import { Card } from '@/components/ui';

type SpecialtyCardProps = {
  specialty: Specialty;
  onSelect?: (specialty: Specialty) => void;
};

export const SpecialtyCard = ({ specialty, onSelect }: SpecialtyCardProps) => {
  const { t } = useTranslation();

  return (
    <Card interactive={Boolean(onSelect)} onClick={() => onSelect?.(specialty)}>
      <p className="text-title">{specialty.name}</p>
      <p className="mt-1 text-subtitle">{specialty.description}</p>
      <p className="mt-3 text-xs font-medium text-brand-600">
        {t('catalog.specialty.avgDuration', { avgDurationMin: specialty.avgDurationMin })}
      </p>
    </Card>
  );
};
