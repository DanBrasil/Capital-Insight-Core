import { IsDateString, IsEnum, ValidateIf } from 'class-validator';

export class ReportFiltersDto {
  @IsEnum(['7d', '30d', '3m', '6m', '1y', 'custom'])
  period!: '7d' | '30d' | '3m' | '6m' | '1y' | 'custom';

  @ValidateIf((obj: ReportFiltersDto) => obj.period === 'custom')
  @IsDateString()
  startDate?: string;

  @ValidateIf((obj: ReportFiltersDto) => obj.period === 'custom')
  @IsDateString()
  endDate?: string;
}
