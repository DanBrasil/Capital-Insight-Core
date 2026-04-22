import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Feature } from '../common/decorators/feature.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { ReportsService } from './reports.service';

@Feature('reports')
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  async getSummary(
    @CurrentUser() user: { tenantId: string; id: string },
    @Query() filters: ReportFiltersDto,
  ) {
    return this.reportsService.getSummary(user.tenantId, user.id, filters);
  }
}
