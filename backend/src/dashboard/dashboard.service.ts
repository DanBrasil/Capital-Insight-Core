import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type DashboardPeriod = 'today' | '7d' | '30d' | 'current-month';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private getPeriodRange(period: DashboardPeriod): { start: Date; end: Date } {
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

  private getPreviousPeriodRange(period: DashboardPeriod): { start: Date; end: Date } {
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

  private async aggregate(
    tenantId: string,
    userId: string,
    range: { start: Date; end: Date },
  ) {
    const where: Prisma.TransactionWhereInput = {
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

  async getSummary(tenantId: string, userId: string, period: DashboardPeriod) {
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

  async getChart(tenantId: string, userId: string, period: DashboardPeriod) {
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

    const buckets = new Map<string, { income: number; expenses: number }>();

    for (const transaction of transactions) {
      let label = '';

      if (period === 'today') {
        const hourBucket = Math.floor(transaction.date.getHours() / 3) * 3;
        label = `${hourBucket.toString().padStart(2, '0')}h`;
      } else if (period === '7d') {
        label = transaction.date.toLocaleDateString('pt-BR', { weekday: 'short' });
      } else {
        const week = Math.ceil(transaction.date.getDate() / 7);
        label = `Sem ${week}`;
      }

      const current = buckets.get(label) ?? { income: 0, expenses: 0 };

      if (transaction.type === 'income') {
        current.income += Number(transaction.amount);
      } else {
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

  async getRecentTransactions(
    tenantId: string,
    userId: string,
    period: DashboardPeriod,
  ) {
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
}
