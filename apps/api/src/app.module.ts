import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { SpecialtiesModule } from './specialties';
import { DoctorsModule } from './doctors';
import { AppointmentsModule } from './appointments';
import { HealthModule } from './health/health.module';
import { AllExceptionsFilter } from './common/filters';

const GLOBAL_THROTTLE_LIMIT = 120;
const GLOBAL_THROTTLE_TTL_MS = 60_000;

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
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
    SpecialtiesModule,
    DoctorsModule,
    AppointmentsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
