import { AuthUserSchema, type AuthUser, type UpdateProfileInput } from '@cortex/shared';
import { apiFetch } from '../../config/network/http.ts';
import { ENDPOINTS } from '../../config/network/endpoints.ts';

export const users = {
  updateProfile: async (input: UpdateProfileInput): Promise<AuthUser> => {
    const data = await apiFetch<unknown>(ENDPOINTS.users.profile, { method: 'PATCH', body: input });
    return AuthUserSchema.parse(data);
  },
};
