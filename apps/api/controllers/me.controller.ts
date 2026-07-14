import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Appointment, AuthUser } from '@cortex/shared';
import { CurrentUser, JwtAuthGuard } from '@/middlewares';
import type { AuthenticatedUser } from '@/types';
import { AppointmentsService, UsersService } from '@/services';
import { MeAppointmentsQueryDto, UpdateProfileDto } from '@/dtos';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly appointments: AppointmentsService,
    private readonly users: UsersService,
  ) {}

  @Get('appointments')
  async listAppointments(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: MeAppointmentsQueryDto,
  ): Promise<Appointment[]> {
    return this.appointments.listMine(user.id, query.scope);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUser> {
    return this.users.updateProfile(user.id, dto);
  }
}
