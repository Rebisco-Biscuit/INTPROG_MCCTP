import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { size_enum } from '../../generated/prisma/client';

export class CreateInventoryDto {
  @IsUUID()
  program_id: string;

  @IsString()
  @MaxLength(100)
  item_name: string;

  // Enum validation is added at the API boundary in the controller/service.
  sizes: size_enum;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000)
  quantity: number;
}
