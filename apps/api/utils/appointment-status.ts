import type { AppointmentStatus } from '@/models';
import { MS_PER_MINUTE } from '@/config';

// Minimal shape shared by Prisma entities and their relation-loaded variants.
type CompletableAppointment = {
  status: AppointmentStatus;
  startsAt: Date;
  durationMin: number;
};

// A CONFIRMED appointment is treated as COMPLETED once its end instant has
// passed. Derived lazily at read/guard time — no cron — mirroring how expired
// holds are treated as free everywhere.
export const isEndedConfirmed = (appointment: CompletableAppointment, now: Date): boolean => {
  if (appointment.status !== 'CONFIRMED') return false;
  const endsAt = appointment.startsAt.getTime() + appointment.durationMin * MS_PER_MINUTE;
  return endsAt <= now.getTime();
};

// True when the appointment is finished, whether persisted as COMPLETED or an
// ended CONFIRMED row not yet relabelled. Used to block cancel/reschedule.
export const isEffectivelyCompleted = (appointment: CompletableAppointment, now: Date): boolean =>
  appointment.status === 'COMPLETED' || isEndedConfirmed(appointment, now);

// The status to present to clients: an ended CONFIRMED row surfaces as COMPLETED.
export const effectiveStatus = (
  appointment: CompletableAppointment,
  now: Date,
): AppointmentStatus => {
  if (isEndedConfirmed(appointment, now)) return 'COMPLETED';
  return appointment.status;
};
