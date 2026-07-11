import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Doctor, Specialty } from '@cortex/shared';
import { SpecialtiesService } from '@/services';

@ApiTags('specialties')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialties: SpecialtiesService) {}

  @Get()
  async list(): Promise<Specialty[]> {
    return this.specialties.list();
  }

  @Get(':id/doctors')
  async listDoctors(@Param('id') id: string): Promise<Doctor[]> {
    return this.specialties.listDoctors(id);
  }
}
