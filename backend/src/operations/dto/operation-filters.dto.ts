import { IsDateString, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export class OperationFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['buy', 'sell', 'all'])
  operationType?: 'buy' | 'sell' | 'all';

  @IsOptional()
  @IsIn(['stock', 'fii', 'bdr', 'etf', 'fixed-income', 'crypto', 'all'])
  assetType?: 'stock' | 'fii' | 'bdr' | 'etf' | 'fixed-income' | 'crypto' | 'all';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['date', 'totalAmount', 'symbol'])
  orderBy?: 'date' | 'totalAmount' | 'symbol';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc';
}
