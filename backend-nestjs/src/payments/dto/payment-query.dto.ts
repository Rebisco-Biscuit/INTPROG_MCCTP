import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

const PAYMENT_REASONS = [
  'PROCESSING_FEE',
  'UNIFORM_ID_FEE',
  'ASSESSMENT_DEPOSIT',
  'EXTERNAL_FEES',
] as const;

const PAYMENT_METHODS = ['CASH', 'GCASH', 'BANK_TRANSFER', 'CHECK'] as const;

function toArray(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value : [value];
}

export class PaymentListQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  @IsIn(PAYMENT_REASONS, { each: true })
  reason?: string[];

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  @IsIn(PAYMENT_METHODS, { each: true })
  paymentMethod?: string[];

  @IsOptional()
  @IsUUID()
  programId?: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsUUID()
  confirmedBy?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(['payment_date', 'amount', 'or_number'])
  sortBy?: 'payment_date' | 'amount' | 'or_number';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
