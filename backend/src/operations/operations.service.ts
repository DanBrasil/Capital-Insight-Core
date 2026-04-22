import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Operation, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { OperationFiltersDto } from './dto/operation-filters.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';

const ASSET_NAME_MAP: Record<string, string> = {
  PETR4: 'Petrobras PN',
  VALE3: 'Vale ON',
  ITUB4: 'Itau Unibanco PN',
  WEGE3: 'WEG ON',
};

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveAssetName(symbol: string): string {
    return ASSET_NAME_MAP[symbol] ?? symbol;
  }

  private computeTotalAmount(quantity: number, unitPrice: number, fees: number): number {
    return Number((quantity * unitPrice + fees).toFixed(2));
  }

  private async getCurrentPosition(
    tenantId: string,
    userId: string,
    symbol: string,
    ignoreOperationId?: string,
  ): Promise<number> {
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

  private async ensureSellHasQuantity(
    tenantId: string,
    userId: string,
    symbol: string,
    sellQuantity: number,
    ignoreOperationId?: string,
  ): Promise<void> {
    const current = await this.getCurrentPosition(
      tenantId,
      userId,
      symbol,
      ignoreOperationId,
    );
    if (sellQuantity > current) {
      throw new UnprocessableEntityException({
        message: `Quantidade insuficiente. Posicao atual: ${current} unidades.`,
        field: 'quantity',
      });
    }
  }

  private toResponse(operation: Operation) {
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

  async findAll(tenantId: string, userId: string, filters: OperationFiltersDto) {
    const where: Prisma.OperationWhereInput = {
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

    const orderByMap: Record<string, Prisma.OperationOrderByWithRelationInput> = {
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

  async create(tenantId: string, userId: string, payload: CreateOperationDto) {
    const symbol = payload.symbol.toUpperCase();
    const operationDate = new Date(payload.operationDate);

    if (operationDate.getTime() > Date.now()) {
      throw new UnprocessableEntityException({
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
        totalAmount: this.computeTotalAmount(
          payload.quantity,
          payload.unitPrice,
          payload.fees,
        ),
        fees: payload.fees,
        operationDate,
        broker: payload.broker,
        notes: payload.notes,
      },
    });

    return this.toResponse(operation);
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    payload: UpdateOperationDto,
  ) {
    const existing = await this.prisma.operation.findFirst({
      where: { id, tenantId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Operacao nao encontrada.');
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

  async remove(tenantId: string, userId: string, id: string): Promise<void> {
    const operation = await this.prisma.operation.findFirst({
      where: { id, tenantId, userId },
    });

    if (!operation) {
      throw new NotFoundException('Operacao nao encontrada.');
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
      } else {
        runningQuantity -= qty;
      }

      if (runningQuantity < 0) {
        throw new UnprocessableEntityException({
          message:
            'Nao e possivel remover esta operacao pois ela invalida vendas posteriores.',
          field: 'operationType',
        });
      }
    }

    await this.prisma.operation.delete({ where: { id } });
  }
}
