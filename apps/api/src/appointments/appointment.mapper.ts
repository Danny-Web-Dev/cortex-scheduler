import type { Appointment as AppointmentDto } from '@cortex/shared';
import type { AppointmentStatus } from '@prisma/client';

export type AppointmentWithRelations = {
  id: string;
  doctorId: string;
  specialtyId: string;
  startsAt: Date;
  durationMin: number;
  status: AppointmentStatus;
  holdExpiresAt: Date | null;
  notes: string | null;
  doctor: { name: string };
  specialty: { name: string };
};

// Maps the Prisma row (with relations) to the shared response DTO. The DB shape
// never leaves the service layer through this.
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
