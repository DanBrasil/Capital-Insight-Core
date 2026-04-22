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
exports.OperationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ASSET_NAME_MAP = {
    PETR4: 'Petrobras PN',
    VALE3: 'Vale ON',
    ITUB4: 'Itau Unibanco PN',
    WEGE3: 'WEG ON',
};
let OperationsService = class OperationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    resolveAssetName(symbol) {
        return ASSET_NAME_MAP[symbol] ?? symbol;
    }
    computeTotalAmount(quantity, unitPrice, fees) {
        return Number((quantity * unitPrice + fees).toFixed(2));
    }
    async getCurrentPosition(tenantId, userId, symbol, ignoreOperationId) {
        const operations = await this.prisma.operation.findMany({
            where: {
                tenantId,
                userId,
                symbol,
                ...(ignoreOperationId ? { id: { not: ignoreOperationId } } : {}),
            },
            orderBy: { operationDate: 'asc' },
        });
        return operations.reduce((acc, item) => {
            const quantity = Number(item.quantity);
            return item.operationType === 'buy' ? acc + quantity : acc - quantity;
        }, 0);
    }
    async ensureSellHasQuantity(tenantId, userId, symbol, sellQuantity, ignoreOperationId) {
        const current = await this.getCurrentPosition(tenantId, userId, symbol, ignoreOperationId);
        if (sellQuantity > current) {
            throw new common_1.UnprocessableEntityException({
                message: `Quantidade insuficiente. Posicao atual: ${current} unidades.`,
                field: 'quantity',
            });
        }
    }
    toResponse(operation) {
        return {
            id: operation.id,
            symbol: operation.symbol,
            assetName: operation.assetName,
            assetType: operation.assetType,
            operationType: operation.operationType,
            quantity: Number(operation.quantity),
            unitPrice: Number(operation.unitPrice),
            totalAmount: Number(operation.totalAmount),
            fees: Number(operation.fees),
            operationDate: operation.operationDate.toISOString(),
            broker: operation.broker,
            notes: operation.notes,
            createdAt: operation.createdAt.toISOString(),
            updatedAt: operation.updatedAt.toISOString(),
        };
    }
    async findAll(tenantId, userId, filters) {
        const where = {
            tenantId,
            userId,
        };
        if (filters.search) {
            where.OR = [
                { symbol: { contains: filters.search, mode: 'insensitive' } },
                { assetName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters.operationType && filters.operationType !== 'all') {
            where.operationType = filters.operationType;
        }
        if (filters.assetType && filters.assetType !== 'all') {
            where.assetType = filters.assetType;
        }
        if (filters.startDate || filters.endDate) {
            where.operationDate = {};
            if (filters.startDate) {
                where.operationDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                where.operationDate.lte = end;
            }
        }
        const orderByMap = {
            date: { operationDate: filters.orderDirection ?? 'desc' },
            totalAmount: { totalAmount: filters.orderDirection ?? 'desc' },
            symbol: { symbol: filters.orderDirection ?? 'desc' },
        };
        const operations = await this.prisma.operation.findMany({
            where,
            orderBy: orderByMap[filters.orderBy ?? 'date'],
        });
        return operations.map((operation) => this.toResponse(operation));
    }
    async create(tenantId, userId, payload) {
        const symbol = payload.symbol.toUpperCase();
        const operationDate = new Date(payload.operationDate);
        if (operationDate.getTime() > Date.now()) {
            throw new common_1.UnprocessableEntityException({
                message: 'Data da operacao nao pode ser no futuro.',
                field: 'operationDate',
            });
        }
        if (payload.operationType === 'sell') {
            await this.ensureSellHasQuantity(tenantId, userId, symbol, payload.quantity);
        }
        const operation = await this.prisma.operation.create({
            data: {
                tenantId,
                userId,
                symbol,
                assetName: this.resolveAssetName(symbol),
                assetType: payload.assetType,
                operationType: payload.operationType,
                quantity: payload.quantity,
                unitPrice: payload.unitPrice,
                totalAmount: this.computeTotalAmount(payload.quantity, payload.unitPrice, payload.fees),
                fees: payload.fees,
                operationDate,
                broker: payload.broker,
                notes: payload.notes,
            },
        });
        return this.toResponse(operation);
    }
    async update(tenantId, userId, id, payload) {
        const existing = await this.prisma.operation.findFirst({
            where: { id, tenantId, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Operacao nao encontrada.');
        }
        const symbol = (payload.symbol ?? existing.symbol).toUpperCase();
        const quantity = payload.quantity ?? Number(existing.quantity);
        const unitPrice = payload.unitPrice ?? Number(existing.unitPrice);
        const fees = payload.fees ?? Number(existing.fees);
        const operationType = payload.operationType ?? existing.operationType;
        if (operationType === 'sell') {
            await this.ensureSellHasQuantity(tenantId, userId, symbol, quantity, id);
        }
        const updated = await this.prisma.operation.update({
            where: { id },
            data: {
                symbol,
                assetName: this.resolveAssetName(symbol),
                assetType: payload.assetType,
                operationType,
                quantity,
                unitPrice,
                fees,
                totalAmount: this.computeTotalAmount(quantity, unitPrice, fees),
                operationDate: payload.operationDate
                    ? new Date(payload.operationDate)
                    : undefined,
                broker: payload.broker,
                notes: payload.notes,
            },
        });
        return this.toResponse(updated);
    }
    async remove(tenantId, userId, id) {
        const operation = await this.prisma.operation.findFirst({
            where: { id, tenantId, userId },
        });
        if (!operation) {
            throw new common_1.NotFoundException('Operacao nao encontrada.');
        }
        const operations = await this.prisma.operation.findMany({
            where: {
                tenantId,
                userId,
                symbol: operation.symbol,
                id: { not: id },
            },
            orderBy: { operationDate: 'asc' },
        });
        let runningQuantity = 0;
        for (const item of operations) {
            const qty = Number(item.quantity);
            if (item.operationType === 'buy') {
                runningQuantity += qty;
            }
            else {
                runningQuantity -= qty;
            }
            if (runningQuantity < 0) {
                throw new common_1.UnprocessableEntityException({
                    message: 'Nao e possivel remover esta operacao pois ela invalida vendas posteriores.',
                    field: 'operationType',
                });
            }
        }
        await this.prisma.operation.delete({ where: { id } });
    }
};
exports.OperationsService = OperationsService;
exports.OperationsService = OperationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OperationsService);
//# sourceMappingURL=operations.service.js.map