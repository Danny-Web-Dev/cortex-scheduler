import { z } from 'zod';
import {
  DoctorSchema,
  SlotsResponseSchema,
  SpecialtySchema,
  type Doctor,
  type SlotsResponse,
  type Specialty,
} from '@cortex/shared';
import { apiFetch } from './http';
import { ENDPOINTS } from './endpoints';

export const catalog = {
  listSpecialties: async (): Promise<Specialty[]> => {
    const data = await apiFetch<unknown>(ENDPOINTS.catalog.specialties, { auth: false });
    return z.array(SpecialtySchema).parse(data);
  },

  listDoctors: async (specialtyId: string): Promise<Doctor[]> => {
    const data = await apiFetch<unknown>(ENDPOINTS.catalog.doctorsBySpecialty(specialtyId), {
      auth: false,
    });
    return z.array(DoctorSchema).parse(data);
  },

  getSlots: async (doctorId: string, date: string): Promise<SlotsResponse> => {
    const data = await apiFetch<unknown>(ENDPOINTS.catalog.slotsByDoctor(doctorId, date), {
      auth: false,
    });
    return SlotsResponseSchema.parse(data);
  },
};
