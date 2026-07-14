import { Global, Module } from '@nestjs/common';
import { OtpRepository } from '../repositories/otp.repository';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { SpecialtyRepository } from '../repositories/specialty.repository';
import { DoctorRepository } from '../repositories/doctor.repository';
import { AppointmentRepository } from '../repositories/appointment.repository';

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
