import type { Doctor } from '@cortex/shared';
import { Card } from '@/components/ui';

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
      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
        ★ {doctor.rating.toFixed(1)}
      </span>
    </div>
    {doctor.bio && <p className="mt-3 text-sm text-ink-500">{doctor.bio}</p>}
  </Card>
);
