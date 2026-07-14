import { Injectable } from '@nestjs/common';
import type { Doctor, Specialty } from '@cortex/shared';
import { DoctorRepository, SpecialtyRepository } from '@/repositories';
import { NotFoundException, toDoctorDto, toSpecialtyDto } from '@/utils';

@Injectable()
export class SpecialtiesService {
  constructor(
    private readonly specialties: SpecialtyRepository,
    private readonly doctors: DoctorRepository,
  ) {}

  async list(): Promise<Specialty[]> {
    const rows = await this.specialties.findAll();
    return rows.map(toSpecialtyDto);
  }

  async listDoctors(specialtyId: string): Promise<Doctor[]> {
    const specialty = await this.specialties.findById(specialtyId);
    if (!specialty) throw new NotFoundException('Specialty not found');

    const rows = await this.doctors.findBySpecialty(specialtyId);
    return rows.map(toDoctorDto);
  }
}
