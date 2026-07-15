import type { AppointmentStatus } from '@/models';
import { MS_PER_MINUTE } from '@/config';

type CompletableAppointment = {
  status: AppointmentStatus;
  startsAt: Date;
  durationMin: number;
};

export const isEndedConfirmed = (appointment: CompletableAppointment, now: Date): boolean => {
  if (appointment.status !== 'CONFIRMED') return false;
  const endsAt = appointment.startsAt.getTime() + appointment.durationMin * MS_PER_MINUTE;
  return endsAt <= now.getTime();
};

export const isEffectivelyCompleted = (appointment: CompletableAppointment, now: Date): boolean =>
  appointment.status === 'COMPLETED' || isEndedConfirmed(appointment, now);

export const effectiveStatus = (
  appointment: CompletableAppointment,
  now: Date,
): AppointmentStatus => {
  if (isEndedConfirmed(appointment, now)) return 'COMPLETED';
  return appointment.status;
};
