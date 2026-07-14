import { Module } from '@nestjs/common';
import { AppointmentsController, MeController } from '@/controllers';
import { AppointmentsService } from '@/services';
import { AuthModule } from './auth.module';
import { DoctorsModule } from './doctors.module';
import { UsersModule } from './users.module';

@Module({
  imports: [DoctorsModule, AuthModule, UsersModule],
  controllers: [AppointmentsController, MeController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
