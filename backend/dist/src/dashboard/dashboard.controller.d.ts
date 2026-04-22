import { DashboardPeriodDto } from './dto/dashboard-period.dto';
import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(user: {
        tenantId: string;
        id: string;
    }, query: DashboardPeriodDto): Promise<{
        balance: {
            label: string;
            value: number;
            previousValue: number;
            isCurrency: boolean;
        };
        income: {
            label: string;
            value: number;
            previousValue: number;
            isCurrency: boolean;
        };
        expenses: {
            label: string;
            value: number;
            previousValue: number;
            isCurrency: boolean;
        };
        transactionCount: {
            label: string;
            value: number;
            previousValue: number;
            isCurrency: boolean;
        };
    }>;
    getChart(user: {
        tenantId: string;
        id: string;
    }, query: DashboardPeriodDto): Promise<{
        label: string;
        income: number;
        expenses: number;
    }[]>;
    getRecentTransactions(user: {
        tenantId: string;
        id: string;
    }, query: DashboardPeriodDto): Promise<{
        id: string;
        description: string;
        amount: number;
        type: string;
        category: string;
        date: string;
    }[]>;
}
