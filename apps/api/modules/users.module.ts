import { Module } from '@nestjs/common';
import { MeProfileController } from '@/controllers';
import { UsersService } from '@/services';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MeProfileController],
  providers: [UsersService],
})
export class UsersModule {}
