import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@/config';
import { PrismaModule } from '@/models';
import { RepositoriesModule } from '@/repositories/repositories.module';
import { AllExceptionsFilter } from '@/middlewares';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { SpecialtiesModule } from './specialties.module';
import { DoctorsModule } from './doctors.module';
import { AppointmentsModule } from './appointments.module';
import { SearchModule } from './search.module';
import { HealthModule } from './health.module';

const GLOBAL_THROTTLE_LIMIT = 120;
const GLOBAL_THROTTLE_TTL_MS = 60_000;

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RepositoriesModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          transport: config.isDevelopment ? { target: 'pino-pretty' } : undefined,
          autoLogging: true,
        },
      }),
    }),
    ThrottlerModule.forRoot([
      { name: 'default', limit: GLOBAL_THROTTLE_LIMIT, ttl: GLOBAL_THROTTLE_TTL_MS },
    ]),
    AuthModule,
    UsersModule,
    SpecialtiesModule,
    DoctorsModule,
    AppointmentsModule,
    SearchModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
