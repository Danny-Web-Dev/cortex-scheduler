import { Injectable } from '@nestjs/common';
import { EnvSchema, type Env } from './env.schema';

@Injectable()
export class ConfigService {
  private readonly env: Env;

  constructor() {
    this.env = EnvSchema.parse(process.env);
  }

  get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  get port(): number {
    return this.env.PORT;
  }

  get jwtSecret(): string {
    return this.env.JWT_SECRET;
  }

  get clinicTz(): string {
    return this.env.CLINIC_TZ;
  }
}
