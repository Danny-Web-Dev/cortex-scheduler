import type { Doctor, DoctorAvailability, Specialty } from '@/models';
import type { Slot } from '@cortex/shared';

export type DoctorWithSchedule = Doctor & {
  specialty: Specialty;
  availability: DoctorAvailability[];
};

export type DoctorWithSpecialtyName = Doctor & { specialty: { name: string } };

export type FreeSlotsContext = {
  doctorId: string;
  specialtyId: string;
  durationMin: number;
  slots: Slot[];
};
