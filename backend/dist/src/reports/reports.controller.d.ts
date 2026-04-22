import { ReportFiltersDto } from './dto/report-filters.dto';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getSummary(user: {
        tenantId: string;
        id: string;
    }, filters: ReportFiltersDto): Promise<{
        summary: {
            totalInvested: number;
            currentValue: number;
            totalProfitLoss: number;
            totalProfitLossPercent: number;
            totalOperations: number;
            bestPerformer: {
                symbol: string;
                name: string;
                profitLoss: number;
                profitLossPercent: number;
                currentValue: number;
            };
            worstPerformer: {
                symbol: string;
                name: string;
                profitLoss: number;
                profitLossPercent: number;
                currentValue: number;
            };
        };
        timeSeries: {
            date: string;
            investedValue: number;
            currentValue: number;
        }[];
        distribution: {
            label: string;
            value: number;
            percentage: number;
        }[];
        operationsAggregate: {
            totalBuys: number;
            totalSells: number;
            totalBuyVolume: number;
            totalSellVolume: number;
            mostNegotiatedAsset: string;
            periodStart: string;
            periodEnd: string;
        };
        topGainers: {
            symbol: string;
            name: string;
            profitLoss: number;
            profitLossPercent: number;
            currentValue: number;
        }[];
        topLosers: {
            symbol: string;
            name: string;
            profitLoss: number;
            profitLossPercent: number;
            currentValue: number;
        }[];
    }>;
}
