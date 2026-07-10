import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchService } from './search.service';
import type { DoctorRepository, SpecialtyRepository } from '../repositories';

const buildService = (specialties: unknown[], doctors: unknown[]) => {
  const specialtySearch = vi.fn().mockResolvedValue(specialties);
  const doctorSearch = vi.fn().mockResolvedValue(doctors);
  const service = new SearchService(
    { search: specialtySearch } as unknown as SpecialtyRepository,
    { search: doctorSearch } as unknown as DoctorRepository,
  );
  return { service, specialtySearch, doctorSearch };
};

describe('SearchService.search', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps specialties and doctors into the response DTO with specialtyName', async () => {
    const { service } = buildService(
      [{ id: 's1', name: 'Cardiology', description: 'Heart', icon: null, avgDurationMin: 30 }],
      [
        {
          id: 'd1',
          name: 'Dr. Heart',
          specialtyId: 's1',
          specialty: { name: 'Cardiology' },
          yearsExperience: 10,
          rating: 4.8,
          bio: 'Cardiologist',
        },
      ],
    );

    const result = await service.search('card');

    expect(result.specialties).toHaveLength(1);
    expect(result.doctors[0]?.specialtyName).toBe('Cardiology');
    expect(result.doctors[0]).not.toHaveProperty('specialty');
  });

  it('delegates the term to both repositories', async () => {
    const { service, specialtySearch, doctorSearch } = buildService([], []);
    await service.search('neuro');
    expect(specialtySearch).toHaveBeenCalledWith('neuro');
    expect(doctorSearch).toHaveBeenCalledWith('neuro');
  });
});
