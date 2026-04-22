import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(user: {
        tenantId: string;
        id: string;
    }, filters: TransactionFiltersDto): Promise<{
        id: string;
        title: string;
        type: "income" | "expense";
        amount: number;
        category: string;
        date: string;
        status: "completed" | "pending" | "cancelled";
        description: string | null;
        createdAt: string;
        updatedAt: string;
    }[]>;
    create(user: {
        tenantId: string;
        id: string;
    }, payload: CreateTransactionDto): Promise<{
        id: string;
        title: string;
        type: "income" | "expense";
        amount: number;
        category: string;
        date: string;
        status: "completed" | "pending" | "cancelled";
        description: string | null;
        createdAt: string;
        updatedAt: string;
    }>;
    update(user: {
        tenantId: string;
        id: string;
    }, id: string, payload: UpdateTransactionDto): Promise<{
        id: string;
        title: string;
        type: "income" | "expense";
        amount: number;
        category: string;
        date: string;
        status: "completed" | "pending" | "cancelled";
        description: string | null;
        createdAt: string;
        updatedAt: string;
    }>;
    remove(user: {
        tenantId: string;
        id: string;
    }, id: string): Promise<void>;
}
