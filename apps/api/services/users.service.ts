import { Injectable } from '@nestjs/common';
import type { AuthUser, UpdateProfileInput } from '@cortex/shared';
import { UserRepository } from '../repositories';

@Injectable()
export class UsersService {
  constructor(private readonly users: UserRepository) {}

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUser> {
    const user = await this.users.updateName(userId, input.name);
    return { id: user.id, phone: user.phone, name: user.name };
  }
}
