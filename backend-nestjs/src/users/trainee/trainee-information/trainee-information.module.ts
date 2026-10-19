import { Module } from '@nestjs/common';
import { TraineeInformationService } from './trainee-information.service';

/**
 * Shared, read-only trainee records. Imported by the role modules that
 * expose it (Admin, Registrar) through their own thin controllers.
 */
@Module({
  providers: [TraineeInformationService],
  exports: [TraineeInformationService],
})
export class TraineeInformationModule {}
