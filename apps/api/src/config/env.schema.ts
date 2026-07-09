import { z } from 'zod';

const DEFAULT_PORT = 3000;

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  CLINIC_TZ: z.string().min(1).default('Asia/Jerusalem'),
});

export type Env = z.infer<typeof EnvSchema>;
