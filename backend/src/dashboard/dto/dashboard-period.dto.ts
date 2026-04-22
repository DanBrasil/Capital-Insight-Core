import { IsEnum } from 'class-validator';

export class DashboardPeriodDto {
  @IsEnum(['today', '7d', '30d', 'current-month'])
  period!: 'today' | '7d' | '30d' | 'current-month';
}
