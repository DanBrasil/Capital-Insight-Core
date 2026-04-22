import { PrismaService } from '../prisma/prisma.service';
type DashboardPeriod = 'today' | '7d' | '30d' | 'current-month';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getPeriodRange;
    private getPreviousPeriodRange;
    private aggregate;
    getSummary(tenantId: string, userId: string, period: DashboardPeriod): Promise<{
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
    getChart(tenantId: string, userId: string, period: DashboardPeriod): Promise<{
        label: string;
        income: number;
        expenses: number;
    }[]>;
    getRecentTransactions(tenantId: string, userId: string, period: DashboardPeriod): Promise<{
        id: string;
        description: string;
        amount: number;
        type: string;
        category: string;
        date: string;
    }[]>;
}
export {};
