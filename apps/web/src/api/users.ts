import { AuthUserSchema, type AuthUser, type UpdateProfileInput } from '@cortex/shared';
import { apiFetch } from './http';
import { ENDPOINTS } from './endpoints';

export const users = {
  updateProfile: async (input: UpdateProfileInput): Promise<AuthUser> => {
    const data = await apiFetch<unknown>(ENDPOINTS.users.profile, { method: 'PATCH', body: input });
    return AuthUserSchema.parse(data);
  },
};
