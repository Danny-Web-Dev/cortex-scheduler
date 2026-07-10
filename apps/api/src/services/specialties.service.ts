import { Injectable } from '@nestjs/common';
import type { Doctor, Specialty } from '@cortex/shared';
import { DoctorRepository, SpecialtyRepository } from '../repositories';
import { NotFoundException } from '../utils';

@Injectable()
export class SpecialtiesService {
  constructor(
    private readonly specialties: SpecialtyRepository,
    private readonly doctors: DoctorRepository,
  ) {}

  async list(): Promise<Specialty[]> {
    const rows = await this.specialties.findAll();
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      avgDurationMin: s.avgDurationMin,
    }));
  }

  async listDoctors(specialtyId: string): Promise<Doctor[]> {
    const specialty = await this.specialties.findById(specialtyId);
    if (!specialty) throw new NotFoundException('Specialty not found');

    const rows = await this.doctors.findBySpecialty(specialtyId);
    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      specialtyId: d.specialtyId,
      yearsExperience: d.yearsExperience,
      rating: d.rating,
      bio: d.bio,
    }));
  }
}
