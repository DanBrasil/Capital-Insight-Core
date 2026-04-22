import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdatePlatformDto {
  @IsOptional()
  @IsBoolean()
  showPortfolioHighlights?: boolean;

  @IsOptional()
  @IsBoolean()
  allowAIInsights?: boolean;

  @IsOptional()
  @IsEnum(['list', 'grid'])
  defaultMarketView?: 'list' | 'grid';
}
