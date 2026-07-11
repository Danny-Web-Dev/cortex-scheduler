import { AuthUserSchema, type AuthUser, type UpdateProfileInput } from '@cortex/shared';
import { apiFetch } from '../api-client';

export const updateProfile = async (input: UpdateProfileInput): Promise<AuthUser> => {
  const data = await apiFetch<unknown>('/me/profile', { method: 'PATCH', body: input });
  return AuthUserSchema.parse(data);
};
