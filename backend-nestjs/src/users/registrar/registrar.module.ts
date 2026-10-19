import { Module } from '@nestjs/common';
import { RegistrarController } from './registrar.controller';
import { RegistrarService } from './registrar.service';
import { EnrollmentsController } from './enrollments/enrollments.controller';
import { RegistrarTraineesController } from './trainees/trainees.controller';
import { EnrollmentsModule } from '../../enrollments/enrollments.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { StudentInformationModule } from '../../student-information/student-information.module';

@Module({
  imports: [PrismaModule, EnrollmentsModule, StudentInformationModule],
  // RegistrarTraineesController stays after EnrollmentsController so
  // GET trainees/search is matched before GET trainees/:id.
  controllers: [
    RegistrarController,
    EnrollmentsController,
    RegistrarTraineesController,
  ],
  providers: [RegistrarService],
})
export class RegistrarModule {}
