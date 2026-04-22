export declare class UpdateOperationDto {
    symbol?: string;
    assetType?: 'stock' | 'fii' | 'bdr' | 'etf' | 'fixed-income' | 'crypto';
    operationType?: 'buy' | 'sell';
    quantity?: number;
    unitPrice?: number;
    fees?: number;
    operationDate?: string;
    broker?: string;
    notes?: string;
}
