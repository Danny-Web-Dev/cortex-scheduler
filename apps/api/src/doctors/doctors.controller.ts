import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { SlotsResponse } from '@cortex/shared';
import { DoctorsService } from './doctors.service';
import { SlotsQueryDto } from './doctors.dto';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctors: DoctorsService) {}

  @Get(':id/slots')
  async getSlots(@Param('id') id: string, @Query() query: SlotsQueryDto): Promise<SlotsResponse> {
    return this.doctors.getSlots(id, query.date);
  }
}
