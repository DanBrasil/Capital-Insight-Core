import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateOperationDto {
  @IsString()
  @Length(1, 20)
  symbol!: string;

  @IsEnum(['stock', 'fii', 'bdr', 'etf', 'fixed-income', 'crypto'])
  assetType!: 'stock' | 'fii' | 'bdr' | 'etf' | 'fixed-income' | 'crypto';

  @IsEnum(['buy', 'sell'])
  operationType!: 'buy' | 'sell';

  @IsNumber()
  @Min(0.000001)
  quantity!: number;

  @IsNumber()
  @Min(0.0001)
  unitPrice!: number;

  @IsNumber()
  @Min(0)
  fees!: number;

  @IsDateString()
  operationDate!: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  broker?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
