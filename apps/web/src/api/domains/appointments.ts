import { z } from 'zod';
import {
  AppointmentSchema,
  type Appointment,
  type AppointmentScope,
  type HoldAppointmentInput,
  type RescheduleAppointmentInput,
} from '@cortex/shared';
import { apiFetch } from '@/config/network/http.ts';
import { ENDPOINTS } from '@/config/network/endpoints.ts';

export const appointments = {
  hold: async (input: HoldAppointmentInput): Promise<Appointment> => {
    const data = await apiFetch<unknown>(ENDPOINTS.appointments.hold, { method: 'POST', body: input });
    return AppointmentSchema.parse(data);
  },

  confirm: async (id: string): Promise<Appointment> => {
    const data = await apiFetch<unknown>(ENDPOINTS.appointments.confirm(id), { method: 'POST' });
    return AppointmentSchema.parse(data);
  },

  releaseHold: async (id: string): Promise<void> => {
    await apiFetch<void>(ENDPOINTS.appointments.releaseHold(id), { method: 'DELETE' });
  },

  listMine: async (scope: AppointmentScope): Promise<Appointment[]> => {
    const data = await apiFetch<unknown>(ENDPOINTS.appointments.mine(scope));
    return z.array(AppointmentSchema).parse(data);
  },

  cancel: async (id: string): Promise<Appointment> => {
    const data = await apiFetch<unknown>(ENDPOINTS.appointments.cancel(id), { method: 'PATCH' });
    return AppointmentSchema.parse(data);
  },

  reschedule: async (id: string, input: RescheduleAppointmentInput): Promise<Appointment> => {
    const data = await apiFetch<unknown>(ENDPOINTS.appointments.reschedule(id), {
      method: 'PATCH',
      body: input,
    });
    return AppointmentSchema.parse(data);
  },
};
