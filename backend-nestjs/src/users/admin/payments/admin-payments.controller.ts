import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { Role } from '../../../common/enums/role.enum';
import { PaymentsService } from '../../../payments/payments.service';
import { CreatePaymentDto } from '../../../payments/dto/create-payment.dto';
import { PaymentListQueryDto } from '../../../payments/dto/payment-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('payments')
  getList(@Query() query: PaymentListQueryDto) {
    return this.paymentsService.getList(query);
  }

  @Get('payments/trainee-options')
  getTraineeOptions(@Query('q') q: string) {
    return this.paymentsService.getTraineeOptions(q ?? '');
  }

  @Get('payments/filter-options')
  getFilterOptions() {
    return this.paymentsService.getFilterOptions();
  }

  @Get('payments/:id')
  getDetail(@Param('id') id: string) {
    return this.paymentsService.getDetail(id);
  }

  @Post('payments')
  createPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.createPayment(dto, user.id);
  }
}
