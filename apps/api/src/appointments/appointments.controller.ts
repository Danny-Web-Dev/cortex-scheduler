import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Appointment } from '@cortex/shared';
import { CurrentUser, JwtAuthGuard, type AuthenticatedUser } from '../auth';
import { AppointmentsService } from './appointments.service';
import { HoldAppointmentDto, RescheduleAppointmentDto } from './appointments.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post('hold')
  @HttpCode(HttpStatus.CREATED)
  async hold(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: HoldAppointmentDto,
  ): Promise<Appointment> {
    return this.appointments.hold(user.id, dto);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Appointment> {
    return this.appointments.confirm(user.id, id);
  }

  @Delete(':id/hold')
  @HttpCode(HttpStatus.NO_CONTENT)
  async releaseHold(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.appointments.releaseHold(user.id, id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Appointment> {
    return this.appointments.cancel(user.id, id);
  }

  @Patch(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  async reschedule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    return this.appointments.reschedule(user.id, id, dto);
  }
}
