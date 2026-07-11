import { useTranslation } from 'react-i18next';
import type { Doctor } from '@cortex/shared';
import { Badge, Card } from '@/components/ui';

type DoctorCardProps = {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
};

export const DoctorCard = ({ doctor, onSelect }: DoctorCardProps) => {
  const { t } = useTranslation();

  return (
    <Card interactive onClick={() => onSelect(doctor)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink-900">{doctor.name}</p>
          <p className="mt-1 text-sm text-ink-500">
            {t('booking.doctor.experience', { yearsExperience: doctor.yearsExperience })}
          </p>
        </div>
        <Badge tone="amber">
          {t('booking.doctor.rating', { rating: doctor.rating.toFixed(1) })}
        </Badge>
      </div>
      {doctor.bio && <p className="mt-3 text-sm text-ink-500">{doctor.bio}</p>}
    </Card>
  );
};
