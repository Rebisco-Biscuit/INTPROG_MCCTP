import { Module } from '@nestjs/common';
import { EnrollmentsModule } from '../../../enrollments/enrollments.module';
import { AdminEnrollmentsController } from './enrollments.controller';

/**
 * Admin enrollment routes (/api/admin/enrollments). Imports the shared
 * EnrollmentsModule so admin and registrar run the same enrollment logic.
 */
@Module({
  imports: [EnrollmentsModule],
  controllers: [AdminEnrollmentsController],
})
export class AdminEnrollmentsModule {}
