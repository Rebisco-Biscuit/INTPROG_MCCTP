import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AdminPaymentsController } from '../users/admin/payments/admin-payments.controller';
import { RegistrarPaymentsController } from '../users/registrar/payments/registrar-payments.controller';

@Module({
  controllers: [AdminPaymentsController, RegistrarPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
