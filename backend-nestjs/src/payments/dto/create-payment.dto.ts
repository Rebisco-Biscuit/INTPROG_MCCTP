import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import {
  payment_method_enum,
  payment_reason_enum,
} from '../../generated/prisma/client';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  enrollment_id: string;

  @IsString()
  @IsUUID()
  idempotency_key: string;

  @IsEnum(payment_reason_enum)
  @IsNotEmpty()
  reason_of_dues: payment_reason_enum;

  @Matches(/^(?=.*[1-9])\d{1,8}(?:\.\d{1,2})?$/)
  base_fee: string;

  @Matches(/^(?=.*[1-9])\d{1,8}(?:\.\d{1,2})?$/)
  amount: string;

  @IsEnum(payment_method_enum)
  @IsNotEmpty()
  payment_method: payment_method_enum;

  @IsDateString()
  payment_date: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
