import { Module } from '@nestjs/common';
import { SpecialtiesController } from '@/controllers';
import { SpecialtiesService } from '@/services';

@Module({
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService],
})
export class SpecialtiesModule {}
