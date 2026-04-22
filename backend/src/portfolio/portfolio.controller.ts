import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Feature } from '../common/decorators/feature.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PortfolioService } from './portfolio.service';

@Feature('portfolio')
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('positions')
  async getPositions(@CurrentUser() user: { tenantId: string; id: string }) {
    return this.portfolioService.getPositions(user.tenantId, user.id);
  }
}
