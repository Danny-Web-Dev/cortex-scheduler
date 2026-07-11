import type { Appointment as AppointmentDto } from '@cortex/shared';
import type { AppointmentWithRelations } from '@/types';
import { effectiveStatus } from './appointment-status';

export const toAppointmentDto = (row: AppointmentWithRelations): AppointmentDto => ({
  id: row.id,
  doctorId: row.doctorId,
  doctorName: row.doctor.name,
  specialtyId: row.specialtyId,
  specialtyName: row.specialty.name,
  startsAt: row.startsAt.toISOString(),
  durationMin: row.durationMin,
  status: effectiveStatus(row, new Date()),
  holdExpiresAt: row.holdExpiresAt ? row.holdExpiresAt.toISOString() : null,
  notes: row.notes,
});
