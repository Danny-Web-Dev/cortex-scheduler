import { z } from 'zod';
import {
  AppointmentSchema,
  type Appointment,
  type AppointmentScope,
  type HoldAppointmentInput,
  type RescheduleAppointmentInput,
} from '@cortex/shared';
import { apiFetch } from '../api-client';

export const holdAppointment = async (input: HoldAppointmentInput): Promise<Appointment> => {
  const data = await apiFetch<unknown>('/appointments/hold', { method: 'POST', body: input });
  return AppointmentSchema.parse(data);
};

export const confirmAppointment = async (id: string): Promise<Appointment> => {
  const data = await apiFetch<unknown>(`/appointments/${id}/confirm`, { method: 'POST' });
  return AppointmentSchema.parse(data);
};

export const releaseHold = async (id: string): Promise<void> => {
  await apiFetch<void>(`/appointments/${id}/hold`, { method: 'DELETE' });
};

export const listMyAppointments = async (scope: AppointmentScope): Promise<Appointment[]> => {
  const data = await apiFetch<unknown>(`/me/appointments?scope=${scope}`);
  return z.array(AppointmentSchema).parse(data);
};

export const cancelAppointment = async (id: string): Promise<Appointment> => {
  const data = await apiFetch<unknown>(`/appointments/${id}/cancel`, { method: 'PATCH' });
  return AppointmentSchema.parse(data);
};

export const rescheduleAppointment = async (
  id: string,
  input: RescheduleAppointmentInput,
): Promise<Appointment> => {
  const data = await apiFetch<unknown>(`/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: input,
  });
  return AppointmentSchema.parse(data);
};
