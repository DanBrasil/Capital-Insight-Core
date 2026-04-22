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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, userId, filters) {
        const where = {
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
        const orderByMap = {
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
            type: transaction.type,
            amount: Number(transaction.amount),
            category: transaction.category,
            date: transaction.date.toISOString(),
            status: transaction.status,
            description: transaction.description,
            createdAt: transaction.createdAt.toISOString(),
            updatedAt: transaction.updatedAt.toISOString(),
        }));
    }
    async create(tenantId, userId, payload) {
        if (payload.amount <= 0) {
            throw new common_1.UnprocessableEntityException({
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
            type: transaction.type,
            amount: Number(transaction.amount),
            category: transaction.category,
            date: transaction.date.toISOString(),
            status: transaction.status,
            description: transaction.description,
            createdAt: transaction.createdAt.toISOString(),
            updatedAt: transaction.updatedAt.toISOString(),
        };
    }
    async update(tenantId, userId, id, payload) {
        const existing = await this.prisma.transaction.findFirst({
            where: { id, tenantId, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Transacao nao encontrada.');
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
            type: updated.type,
            amount: Number(updated.amount),
            category: updated.category,
            date: updated.date.toISOString(),
            status: updated.status,
            description: updated.description,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
        };
    }
    async remove(tenantId, userId, id) {
        const existing = await this.prisma.transaction.findFirst({
            where: { id, tenantId, userId },
            select: { id: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Transacao nao encontrada.');
        }
        await this.prisma.transaction.delete({ where: { id } });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map