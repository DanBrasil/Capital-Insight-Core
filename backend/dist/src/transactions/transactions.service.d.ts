import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
export declare class TransactionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, userId: string, filters: TransactionFiltersDto): Promise<Array<{
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
    }>>;
    create(tenantId: string, userId: string, payload: CreateTransactionDto): Promise<{
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
    }>;
    update(tenantId: string, userId: string, id: string, payload: UpdateTransactionDto): Promise<{
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
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<void>;
}
