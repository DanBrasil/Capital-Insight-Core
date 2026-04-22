export declare class OperationFiltersDto {
    search?: string;
    operationType?: 'buy' | 'sell' | 'all';
    assetType?: 'stock' | 'fii' | 'bdr' | 'etf' | 'fixed-income' | 'crypto' | 'all';
    startDate?: string;
    endDate?: string;
    orderBy?: 'date' | 'totalAmount' | 'symbol';
    orderDirection?: 'asc' | 'desc';
}
