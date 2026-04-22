import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsEnum(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'])
  dateFormat?: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';

  @IsOptional()
  @IsEnum(['BRL', 'USD', 'EUR'])
  currencyFormat?: 'BRL' | 'USD' | 'EUR';
}
