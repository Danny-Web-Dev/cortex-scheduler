import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@cortex/shared';
import { CurrentUser, JwtAuthGuard } from '@/middlewares';
import type { AuthenticatedUser } from '@/types';
import { UsersService } from '@/services';
import { UpdateProfileDto } from '@/dtos';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeProfileController {
  constructor(private readonly users: UsersService) {}

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUser> {
    return this.users.updateProfile(user.id, dto);
  }
}
