import { Module } from '@nestjs/common';
import { StudentInformationModule } from '../../../student-information/student-information.module';
import { AdminTraineesController } from './trainees.controller';

@Module({
  imports: [StudentInformationModule],
  controllers: [AdminTraineesController],
})
export class AdminTraineesModule {}
