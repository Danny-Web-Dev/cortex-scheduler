import { z } from 'zod';

// Validate the Vite env at module load — fail loudly in dev if misconfigured.
const EnvSchema = z.object({
  VITE_API_URL: z.string().min(1).default('/api'),
});

export const env = EnvSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});
