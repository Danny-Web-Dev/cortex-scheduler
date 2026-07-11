import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Appointment } from '@cortex/shared';
import { CurrentUser, JwtAuthGuard } from '@/middlewares';
import type { AuthenticatedUser } from '@/types';
import { AppointmentsService } from '@/services';
import { MeAppointmentsQueryDto } from '@/dtos';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeAppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Get('appointments')
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: MeAppointmentsQueryDto,
  ): Promise<Appointment[]> {
    return this.appointments.listMine(user.id, query.scope);
  }
}
