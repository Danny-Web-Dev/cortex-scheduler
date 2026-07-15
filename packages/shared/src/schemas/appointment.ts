import { z } from 'zod';

const APPOINTMENT_STATUSES = ['HELD', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;
const AppointmentStatusSchema = z.enum(APPOINTMENT_STATUSES);
export type AppointmentStatusValue = z.infer<typeof AppointmentStatusSchema>;

export const SpecialtySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  avgDurationMin: z.number().int(),
});
export type Specialty = z.infer<typeof SpecialtySchema>;

export const DoctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialtyId: z.string(),
  yearsExperience: z.number().int(),
  rating: z.number(),
  bio: z.string().nullable(),
});
export type Doctor = z.infer<typeof DoctorSchema>;

const SlotSchema = z.object({
  startsAt: z.string().datetime(),
  durationMin: z.number().int(),
});
export type Slot = z.infer<typeof SlotSchema>;

export const SlotsResponseSchema = z.object({
  doctorId: z.string(),
  date: z.string(),
  slots: z.array(SlotSchema),
});
export type SlotsResponse = z.infer<typeof SlotsResponseSchema>;

export const SlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
});

const AppointmentScopeSchema = z.enum(['upcoming', 'past']);
export type AppointmentScope = z.infer<typeof AppointmentScopeSchema>;

export const MeAppointmentsQuerySchema = z.object({
  scope: AppointmentScopeSchema.default('upcoming'),
});

export const HoldAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  startsAt: z.string().datetime(), // UTC ISO, re-validated server-side
});
export type HoldAppointmentInput = z.infer<typeof HoldAppointmentSchema>;

export const RescheduleAppointmentSchema = z.object({
  startsAt: z.string().datetime(),
});
export type RescheduleAppointmentInput = z.infer<typeof RescheduleAppointmentSchema>;

export const AppointmentSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  doctorName: z.string(),
  specialtyId: z.string(),
  specialtyName: z.string(),
  startsAt: z.string().datetime(),
  durationMin: z.number().int(),
  status: AppointmentStatusSchema,
  holdExpiresAt: z.string().datetime().nullable(),
  notes: z.string().nullable(),
});
export type Appointment = z.infer<typeof AppointmentSchema>;
