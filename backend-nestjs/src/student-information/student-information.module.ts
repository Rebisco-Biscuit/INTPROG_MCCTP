import { Module } from '@nestjs/common';
import { StudentInformationService } from './student-information.service';

/**
 * Shared, read-only trainee records. Imported by the role modules that
 * expose it (Admin, Registrar) through their own thin controllers.
 */
@Module({
  providers: [StudentInformationService],
  exports: [StudentInformationService],
})
export class StudentInformationModule {}
