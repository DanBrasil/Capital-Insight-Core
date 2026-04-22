import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateOperationDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  symbol?: string;

  @IsOptional()
  @IsEnum(['stock', 'fii', 'bdr', 'etf', 'fixed-income', 'crypto'])
  assetType?: 'stock' | 'fii' | 'bdr' | 'etf' | 'fixed-income' | 'crypto';

  @IsOptional()
  @IsEnum(['buy', 'sell'])
  operationType?: 'buy' | 'sell';

  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fees?: number;

  @IsOptional()
  @IsDateString()
  operationDate?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  broker?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
