export declare class TransactionFiltersDto {
    search?: string;
    type?: 'income' | 'expense' | 'all';
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    orderBy?: 'date' | 'amount' | 'title';
    orderDir?: 'asc' | 'desc';
}
