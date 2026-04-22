import { CreateOperationDto } from './dto/create-operation.dto';
import { OperationFiltersDto } from './dto/operation-filters.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { OperationsService } from './operations.service';
export declare class OperationsController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    findAll(user: {
        tenantId: string;
        id: string;
    }, filters: OperationFiltersDto): Promise<{
        id: string;
        symbol: string;
        assetName: string;
        assetType: string;
        operationType: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
        fees: number;
        operationDate: string;
        broker: string | null;
        notes: string | null;
        createdAt: string;
        updatedAt: string;
    }[]>;
    create(user: {
        tenantId: string;
        id: string;
    }, payload: CreateOperationDto): Promise<{
        id: string;
        symbol: string;
        assetName: string;
        assetType: string;
        operationType: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
        fees: number;
        operationDate: string;
        broker: string | null;
        notes: string | null;
        createdAt: string;
        updatedAt: string;
    }>;
    update(user: {
        tenantId: string;
        id: string;
    }, id: string, payload: UpdateOperationDto): Promise<{
        id: string;
        symbol: string;
        assetName: string;
        assetType: string;
        operationType: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
        fees: number;
        operationDate: string;
        broker: string | null;
        notes: string | null;
        createdAt: string;
        updatedAt: string;
    }>;
    remove(user: {
        tenantId: string;
        id: string;
    }, id: string): Promise<void>;
}
