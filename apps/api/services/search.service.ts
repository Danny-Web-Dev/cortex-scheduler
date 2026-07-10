import { Injectable } from '@nestjs/common';
import type { SearchResult } from '@cortex/shared';
import { DoctorRepository, SpecialtyRepository } from '../repositories';

@Injectable()
export class SearchService {
  constructor(
    private readonly specialties: SpecialtyRepository,
    private readonly doctors: DoctorRepository,
  ) {}

  // Smart search across specialties and doctors in one query. MySQL's default
  // collation is case-insensitive, so `contains` matches regardless of case.
  async search(term: string): Promise<SearchResult> {
    const [specialties, doctors] = await Promise.all([
      this.specialties.search(term),
      this.doctors.search(term),
    ]);

    return {
      specialties: specialties.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        avgDurationMin: s.avgDurationMin,
      })),
      doctors: doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialtyId: d.specialtyId,
        specialtyName: d.specialty.name,
        yearsExperience: d.yearsExperience,
        rating: d.rating,
        bio: d.bio,
      })),
    };
  }
}
