import { z } from 'zod';
import {
  DoctorSchema,
  SlotsResponseSchema,
  SpecialtySchema,
  type Doctor,
  type SlotsResponse,
  type Specialty,
} from '@cortex/shared';
import { apiFetch } from '@/lib';

export const listSpecialties = async (): Promise<Specialty[]> => {
  const data = await apiFetch<unknown>('/specialties', { auth: false });
  return z.array(SpecialtySchema).parse(data);
};

export const listDoctors = async (specialtyId: string): Promise<Doctor[]> => {
  const data = await apiFetch<unknown>(`/specialties/${specialtyId}/doctors`, { auth: false });
  return z.array(DoctorSchema).parse(data);
};

export const getSlots = async (doctorId: string, date: string): Promise<SlotsResponse> => {
  const data = await apiFetch<unknown>(`/doctors/${doctorId}/slots?date=${date}`, { auth: false });
  return SlotsResponseSchema.parse(data);
};
