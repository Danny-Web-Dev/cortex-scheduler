import { createZodDto } from 'nestjs-zod';
import {
  HoldAppointmentSchema,
  MeAppointmentsQuerySchema,
  RescheduleAppointmentSchema,
} from '@cortex/shared';

export class HoldAppointmentDto extends createZodDto(HoldAppointmentSchema) {}
export class RescheduleAppointmentDto extends createZodDto(RescheduleAppointmentSchema) {}
export class MeAppointmentsQueryDto extends createZodDto(MeAppointmentsQuerySchema) {}
