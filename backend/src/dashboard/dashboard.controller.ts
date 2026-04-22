import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { DashboardPeriodDto } from './dto/dashboard-period.dto';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @CurrentUser() user: { tenantId: string; id: string },
    @Query() query: DashboardPeriodDto,
  ) {
    return this.dashboardService.getSummary(user.tenantId, user.id, query.period);
  }

  @Get('chart')
  async getChart(
    @CurrentUser() user: { tenantId: string; id: string },
    @Query() query: DashboardPeriodDto,
  ) {
    return this.dashboardService.getChart(user.tenantId, user.id, query.period);
  }

  @Get('transactions/recent')
  async getRecentTransactions(
    @CurrentUser() user: { tenantId: string; id: string },
    @Query() query: DashboardPeriodDto,
  ) {
    return this.dashboardService.getRecentTransactions(
      user.tenantId,
      user.id,
      query.period,
    );
  }
}
