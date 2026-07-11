import type { Appointment, AppointmentStatus } from '@prisma/client';

export type SlotOccupancy = Pick<Appointment, 'startsAt' | 'status' | 'holdExpiresAt'>;

export type CreateAppointment = {
  userId: string;
  doctorId: string;
  specialtyId: string;
  startsAt: Date;
  durationMin: number;
  status: AppointmentStatus;
  holdExpiresAt?: Date | null;
  slotKey?: string | null;
};

export type AppointmentStatusUpdate = {
  status: AppointmentStatus;
  holdExpiresAt?: Date | null;
  slotKey?: string | null;
};

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
