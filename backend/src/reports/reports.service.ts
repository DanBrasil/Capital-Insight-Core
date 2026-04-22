import { Injectable } from '@nestjs/common';
import { PortfolioService } from '../portfolio/portfolio.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReportFiltersDto } from './dto/report-filters.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portfolioService: PortfolioService,
  ) {}

  private getRange(filters: ReportFiltersDto): { start: Date; end: Date } {
    const end = new Date();

    if (filters.period === 'custom' && filters.startDate && filters.endDate) {
      return { start: new Date(filters.startDate), end: new Date(filters.endDate) };
    }

    const start = new Date();
    if (filters.period === '7d') start.setDate(start.getDate() - 6);
    if (filters.period === '30d') start.setDate(start.getDate() - 29);
    if (filters.period === '3m') start.setMonth(start.getMonth() - 3);
    if (filters.period === '6m') start.setMonth(start.getMonth() - 6);
    if (filters.period === '1y') start.setFullYear(start.getFullYear() - 1);

    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  async getSummary(
    tenantId: string,
    userId: string,
    filters: ReportFiltersDto,
  ) {
    const range = this.getRange(filters);
    const portfolio = await this.portfolioService.getPositions(tenantId, userId);

    const operations = await this.prisma.operation.findMany({
      where: {
        tenantId,
        userId,
        operationDate: {
          gte: range.start,
          lte: range.end,
        },
      },
      orderBy: { operationDate: 'asc' },
    });

    const totalOperations = operations.length;
    const totalBuys = operations.filter((op) => op.operationType === 'buy').length;
    const totalSells = operations.filter((op) => op.operationType === 'sell').length;

    const totalBuyVolume = operations
      .filter((op) => op.operationType === 'buy')
      .reduce((acc, op) => acc + Number(op.totalAmount), 0);
    const totalSellVolume = operations
      .filter((op) => op.operationType === 'sell')
      .reduce((acc, op) => acc + Number(op.totalAmount), 0);

    const symbolCount = new Map<string, number>();
    for (const op of operations) {
      symbolCount.set(op.symbol, (symbolCount.get(op.symbol) ?? 0) + 1);
    }

    const mostNegotiatedAsset = Array.from(symbolCount.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    const distributionByType = new Map<string, number>();
    for (const item of portfolio.positions) {
      distributionByType.set(
        item.type,
        (distributionByType.get(item.type) ?? 0) + item.currentValue,
      );
    }

    const distribution = Array.from(distributionByType.entries()).map(
      ([label, value]) => ({
        label,
        value: Number(value.toFixed(2)),
        percentage:
          portfolio.summary.currentValue > 0
            ? Number(((value / portfolio.summary.currentValue) * 100).toFixed(2))
            : 0,
      }),
    );

    const topMovers = [...portfolio.positions].sort(
      (a, b) => b.profitLossPercent - a.profitLossPercent,
    );

    const topGainers = topMovers
      .filter((item) => item.profitLossPercent > 0)
      .slice(0, 3)
      .map((item) => ({
        symbol: item.symbol,
        name: item.name,
        profitLoss: item.profitLoss,
        profitLossPercent: item.profitLossPercent,
        currentValue: item.currentValue,
      }));

    const topLosers = [...topMovers]
      .sort((a, b) => a.profitLossPercent - b.profitLossPercent)
      .filter((item) => item.profitLossPercent < 0)
      .slice(0, 3)
      .map((item) => ({
        symbol: item.symbol,
        name: item.name,
        profitLoss: item.profitLoss,
        profitLossPercent: item.profitLossPercent,
        currentValue: item.currentValue,
      }));

    const dayMap = new Map<string, number>();
    for (const op of operations) {
      if (op.operationType !== 'buy') continue;
      const day = op.operationDate.toISOString().slice(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + Number(op.totalAmount));
    }

    let cumulative = 0;
    const scale =
      portfolio.summary.totalInvested > 0
        ? portfolio.summary.currentValue / portfolio.summary.totalInvested
        : 1;

    const timeSeries = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, invested]) => {
        cumulative += invested;
        return {
          date,
          investedValue: Number(cumulative.toFixed(2)),
          currentValue: Number((cumulative * scale).toFixed(2)),
        };
      });

    const bestPerformer = topGainers[0] ?? null;
    const worstPerformer = topLosers[0] ?? null;

    return {
      summary: {
        totalInvested: portfolio.summary.totalInvested,
        currentValue: portfolio.summary.currentValue,
        totalProfitLoss: portfolio.summary.totalProfitLoss,
        totalProfitLossPercent: portfolio.summary.totalProfitLossPercent,
        totalOperations,
        bestPerformer,
        worstPerformer,
      },
      timeSeries,
      distribution,
      operationsAggregate: {
        totalBuys,
        totalSells,
        totalBuyVolume: Number(totalBuyVolume.toFixed(2)),
        totalSellVolume: Number(totalSellVolume.toFixed(2)),
        mostNegotiatedAsset: mostNegotiatedAsset ?? null,
        periodStart: range.start.toISOString().slice(0, 10),
        periodEnd: range.end.toISOString().slice(0, 10),
      },
      topGainers,
      topLosers,
    };
  }
}
