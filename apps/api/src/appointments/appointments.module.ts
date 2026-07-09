import { Module } from '@nestjs/common';
import { DoctorsModule } from '../doctors';
import { AuthModule } from '../auth';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MeAppointmentsController } from './me-appointments.controller';

@Module({
  imports: [DoctorsModule, AuthModule],
  controllers: [AppointmentsController, MeAppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
