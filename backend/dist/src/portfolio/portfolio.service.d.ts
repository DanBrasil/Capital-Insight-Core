import { PrismaService } from '../prisma/prisma.service';
export declare class PortfolioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPositions(tenantId: string, userId: string): Promise<{
        positions: {
            symbol: string;
            name: string;
            type: string;
            quantity: number;
            averagePrice: number;
            investedAmount: number;
            currentPrice: number;
            currentValue: number;
            profitLoss: number;
            profitLossPercent: number;
            allocationPercent: number;
        }[];
        summary: {
            totalInvested: number;
            currentValue: number;
            totalProfitLoss: number;
            totalProfitLossPercent: number;
            totalAssets: number;
            topPerformer: {
                symbol: string;
                name: string;
                profitLossPercent: number;
            } | null;
            worstPerformer: {
                symbol: string;
                name: string;
                profitLossPercent: number;
            } | null;
            largestAllocation: {
                symbol: string;
                name: string;
                allocationPercent: number;
            } | null;
        };
        distribution: {
            symbol: string;
            name: string;
            type: string;
            currentValue: number;
            allocationPercent: number;
        }[];
    }>;
}
