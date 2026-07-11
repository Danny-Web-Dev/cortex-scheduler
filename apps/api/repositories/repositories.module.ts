import { Global, Module } from '@nestjs/common';
import { OtpRepository } from './otp.repository';
import { UserRepository } from './user.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { SpecialtyRepository } from './specialty.repository';
import { DoctorRepository } from './doctor.repository';
import { AppointmentRepository } from './appointment.repository';

const REPOSITORIES = [
  OtpRepository,
  UserRepository,
  RefreshTokenRepository,
  SpecialtyRepository,
  DoctorRepository,
  AppointmentRepository,
];

@Global()
@Module({
  providers: REPOSITORIES,
  exports: REPOSITORIES,
})
export class RepositoriesModule {}
