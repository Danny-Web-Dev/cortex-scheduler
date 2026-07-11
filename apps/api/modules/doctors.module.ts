import { Module } from '@nestjs/common';
import { DoctorsController } from '@/controllers';
import { DoctorsService } from '@/services';

@Module({
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
