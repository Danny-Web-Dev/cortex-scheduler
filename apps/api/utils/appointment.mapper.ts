import type { Appointment as AppointmentDto } from '@cortex/shared';
import type { AppointmentWithRelations } from '../types';

export const toAppointmentDto = (row: AppointmentWithRelations): AppointmentDto => ({
  id: row.id,
  doctorId: row.doctorId,
  doctorName: row.doctor.name,
  specialtyId: row.specialtyId,
  specialtyName: row.specialty.name,
  startsAt: row.startsAt.toISOString(),
  durationMin: row.durationMin,
  status: row.status,
  holdExpiresAt: row.holdExpiresAt ? row.holdExpiresAt.toISOString() : null,
  notes: row.notes,
});
