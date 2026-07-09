import { Injectable } from '@nestjs/common';
import { EnvSchema, type Env } from './env.schema';

// The single place in the app where process.env is read. Validated at construction
// so the process fails fast on boot if any required env var is missing or malformed.
@Injectable()
export class ConfigService {
  private readonly env: Env;

  constructor() {
    this.env = EnvSchema.parse(process.env);
  }

  get nodeEnv(): Env['NODE_ENV'] {
    return this.env.NODE_ENV;
  }

  get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  get port(): number {
    return this.env.PORT;
  }

  get databaseUrl(): string {
    return this.env.DATABASE_URL;
  }

  get jwtSecret(): string {
    return this.env.JWT_SECRET;
  }

  get clinicTz(): string {
    return this.env.CLINIC_TZ;
  }
}
