import { Module } from '@nestjs/common';
import { AppointmentsController, MeAppointmentsController } from './controllers';
import { AppointmentsService } from './services';
import { AuthModule } from './auth.module';
import { DoctorsModule } from './doctors.module';

@Module({
  imports: [DoctorsModule, AuthModule],
  controllers: [AppointmentsController, MeAppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
