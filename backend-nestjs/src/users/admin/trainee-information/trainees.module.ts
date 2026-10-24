import { Module } from '@nestjs/common';
import { TraineeInformationModule } from '../../../trainee-information/trainee-information.module';
import { AdminTraineesController } from './trainees.controller';

@Module({
  imports: [TraineeInformationModule],
  controllers: [AdminTraineesController],
})
export class AdminTraineesModule {}
