import type { Doctor as DoctorDto, Specialty as SpecialtyDto } from '@cortex/shared';
import type { Doctor, Specialty } from '@/models';

export const toSpecialtyDto = (row: Specialty): SpecialtyDto => ({
  id: row.id,
  name: row.name,
  description: row.description,
  icon: row.icon,
  avgDurationMin: row.avgDurationMin,
});

export const toDoctorDto = (row: Doctor): DoctorDto => ({
  id: row.id,
  name: row.name,
  specialtyId: row.specialtyId,
  yearsExperience: row.yearsExperience,
  rating: row.rating,
  bio: row.bio,
});
