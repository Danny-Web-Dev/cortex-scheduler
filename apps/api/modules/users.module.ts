import { Module } from '@nestjs/common';
import { UsersService } from '@/services';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
