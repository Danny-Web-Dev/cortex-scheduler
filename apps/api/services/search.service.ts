import { Injectable } from '@nestjs/common';
import type { SearchResult } from '@cortex/shared';
import { DoctorRepository, SpecialtyRepository } from '@/repositories';
import { toDoctorDto, toSpecialtyDto } from '@/utils';

@Injectable()
export class SearchService {
  constructor(
    private readonly specialties: SpecialtyRepository,
    private readonly doctors: DoctorRepository,
  ) {}

  async search(term: string): Promise<SearchResult> {
    const [specialties, doctors] = await Promise.all([
      this.specialties.search(term),
      this.doctors.search(term),
    ]);

    return {
      specialties: specialties.map(toSpecialtyDto),
      doctors: doctors.map((d) => ({ ...toDoctorDto(d), specialtyName: d.specialty.name })),
    };
  }
}
