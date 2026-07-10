// The database entities, sourced from the Prisma schema (prisma/schema.prisma).
// Re-exported here so the rest of the app refers to domain models from one place
// rather than reaching into the Prisma client directly.
export type {
  User,
  OtpCode,
  RefreshToken,
  Specialty,
  Doctor,
  DoctorAvailability,
  Appointment,
} from '@prisma/client';

export { AppointmentStatus } from '@prisma/client';
