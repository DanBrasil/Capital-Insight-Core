import { Module } from '@nestjs/common';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [PortfolioModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
