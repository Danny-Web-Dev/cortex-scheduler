import type { Doctor } from '@cortex/shared';
import { Badge, Card } from '@/components/ui';

type DoctorCardProps = {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
};

export const DoctorCard = ({ doctor, onSelect }: DoctorCardProps) => (
  <Card interactive onClick={() => onSelect(doctor)}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-ink-900">{doctor.name}</p>
        <p className="mt-1 text-sm text-ink-500">{doctor.yearsExperience} yrs experience</p>
      </div>
      <Badge tone="amber">★ {doctor.rating.toFixed(1)}</Badge>
    </div>
    {doctor.bio && <p className="mt-3 text-sm text-ink-500">{doctor.bio}</p>}
  </Card>
);
