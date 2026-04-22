export declare class UpdateTransactionDto {
    title?: string;
    type?: 'income' | 'expense';
    amount?: number;
    category?: string;
    date?: string;
    status?: 'completed' | 'pending' | 'cancelled';
    description?: string;
}
