"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getPeriodRange(period) {
        const now = new Date();
        const end = new Date(now);
        if (period === 'today') {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        }
        if (period === '7d') {
            const start = new Date(now);
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        }
        if (period === '30d') {
            const start = new Date(now);
            start.setDate(start.getDate() - 29);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        }
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start, end };
    }
    getPreviousPeriodRange(period) {
        const current = this.getPeriodRange(period);
        if (period === 'today') {
            const start = new Date(current.start);
            start.setDate(start.getDate() - 1);
            const end = new Date(current.start);
            end.setMilliseconds(-1);
            return { start, end };
        }
        if (period === 'current-month') {
            const start = new Date(current.start.getFullYear(), current.start.getMonth() - 1, 1);
            const end = new Date(current.start);
            end.setMilliseconds(-1);
            return { start, end };
        }
        const diff = current.end.getTime() - current.start.getTime();
        const end = new Date(current.start);
        end.setMilliseconds(-1);
        const start = new Date(end.getTime() - diff);
        return { start, end };
    }
    async aggregate(tenantId, userId, range) {
        const where = {
            tenantId,
            userId,
            status: 'completed',
            date: {
                gte: range.start,
                lte: range.end,
            },
        };
        const [incomeAgg, expensesAgg, count] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: { ...where, type: 'income' },
                _sum: { amount: true },
            }),
            this.prisma.transaction.aggregate({
                where: { ...where, type: 'expense' },
                _sum: { amount: true },
            }),
            this.prisma.transaction.count({ where }),
        ]);
        const income = Number(incomeAgg._sum.amount ?? 0);
        const expenses = Number(expensesAgg._sum.amount ?? 0);
        return {
            income,
            expenses,
            balance: income - expenses,
            transactionCount: count,
        };
    }
    async getSummary(tenantId, userId, period) {
        const currentRange = this.getPeriodRange(period);
        const previousRange = this.getPreviousPeriodRange(period);
        const [current, previous] = await Promise.all([
            this.aggregate(tenantId, userId, currentRange),
            this.aggregate(tenantId, userId, previousRange),
        ]);
        return {
            balance: {
                label: 'Saldo atual',
                value: current.balance,
                previousValue: previous.balance,
                isCurrency: true,
            },
            income: {
                label: 'Receitas',
                value: current.income,
                previousValue: previous.income,
                isCurrency: true,
            },
            expenses: {
                label: 'Despesas',
                value: current.expenses,
                previousValue: previous.expenses,
                isCurrency: true,
            },
            transactionCount: {
                label: 'Transacoes',
                value: current.transactionCount,
                previousValue: previous.transactionCount,
                isCurrency: false,
            },
        };
    }
    async getChart(tenantId, userId, period) {
        const range = this.getPeriodRange(period);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                userId,
                status: 'completed',
                date: { gte: range.start, lte: range.end },
            },
            orderBy: { date: 'asc' },
            select: { date: true, type: true, amount: true },
        });
        const buckets = new Map();
        for (const transaction of transactions) {
            let label = '';
            if (period === 'today') {
                const hourBucket = Math.floor(transaction.date.getHours() / 3) * 3;
                label = `${hourBucket.toString().padStart(2, '0')}h`;
            }
            else if (period === '7d') {
                label = transaction.date.toLocaleDateString('pt-BR', { weekday: 'short' });
            }
            else {
                const week = Math.ceil(transaction.date.getDate() / 7);
                label = `Sem ${week}`;
            }
            const current = buckets.get(label) ?? { income: 0, expenses: 0 };
            if (transaction.type === 'income') {
                current.income += Number(transaction.amount);
            }
            else {
                current.expenses += Number(transaction.amount);
            }
            buckets.set(label, current);
        }
        return Array.from(buckets.entries()).map(([label, values]) => ({
            label,
            income: Number(values.income.toFixed(2)),
            expenses: Number(values.expenses.toFixed(2)),
        }));
    }
    async getRecentTransactions(tenantId, userId, period) {
        const range = this.getPeriodRange(period);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                userId,
                status: 'completed',
                date: { gte: range.start, lte: range.end },
            },
            orderBy: { date: 'desc' },
            take: 7,
        });
        return transactions.map((transaction) => ({
            id: transaction.id,
            description: transaction.title,
            amount: Number(transaction.amount),
            type: transaction.type,
            category: transaction.category,
            date: transaction.date.toISOString(),
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map