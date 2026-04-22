import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    userId: string,
    filters: TransactionFiltersDto,
  ): Promise<
    Array<{
      id: string;
      title: string;
      type: 'income' | 'expense';
      amount: number;
      category: string;
      date: string;
      status: 'completed' | 'pending' | 'cancelled';
      description: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    const where: Prisma.TransactionWhereInput = {
      tenantId,
      userId,
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.type && filters.type !== 'all') {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};

      if (filters.dateFrom) {
        where.date.gte = new Date(filters.dateFrom);
      }

      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    const orderByMap: Record<string, Prisma.TransactionOrderByWithRelationInput> = {
      date: { date: filters.orderDir ?? 'desc' },
      amount: { amount: filters.orderDir ?? 'desc' },
      title: { title: filters.orderDir ?? 'desc' },
    };

    const orderBy = orderByMap[filters.orderBy ?? 'date'];

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy,
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      title: transaction.title,
      type: transaction.type as 'income' | 'expense',
      amount: Number(transaction.amount),
      category: transaction.category,
      date: transaction.date.toISOString(),
      status: transaction.status as 'completed' | 'pending' | 'cancelled',
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    }));
  }

  async create(
    tenantId: string,
    userId: string,
    payload: CreateTransactionDto,
  ): Promise<{
    id: string;
    title: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    status: 'completed' | 'pending' | 'cancelled';
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }> {
    if (payload.amount <= 0) {
      throw new UnprocessableEntityException({
        message: "O campo 'amount' deve ser positivo",
        field: 'amount',
      });
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        tenantId,
        userId,
        title: payload.title,
        type: payload.type,
        amount: payload.amount,
        category: payload.category,
        date: new Date(payload.date),
        status: payload.status,
        description: payload.description,
      },
    });

    return {
      id: transaction.id,
      title: transaction.title,
      type: transaction.type as 'income' | 'expense',
      amount: Number(transaction.amount),
      category: transaction.category,
      date: transaction.date.toISOString(),
      status: transaction.status as 'completed' | 'pending' | 'cancelled',
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    payload: UpdateTransactionDto,
  ): Promise<{
    id: string;
    title: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    status: 'completed' | 'pending' | 'cancelled';
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }> {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, tenantId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Transacao nao encontrada.');
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        title: payload.title,
        type: payload.type,
        amount: payload.amount,
        category: payload.category,
        date: payload.date ? new Date(payload.date) : undefined,
        status: payload.status,
        description: payload.description,
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      type: updated.type as 'income' | 'expense',
      amount: Number(updated.amount),
      category: updated.category,
      date: updated.date.toISOString(),
      status: updated.status as 'completed' | 'pending' | 'cancelled',
      description: updated.description,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async remove(tenantId: string, userId: string, id: string): Promise<void> {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, tenantId, userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Transacao nao encontrada.');
    }

    await this.prisma.transaction.delete({ where: { id } });
  }
}
