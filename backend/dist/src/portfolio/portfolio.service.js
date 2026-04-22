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
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PortfolioService = class PortfolioService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPositions(tenantId, userId) {
        const operations = await this.prisma.operation.findMany({
            where: { tenantId, userId },
            orderBy: { operationDate: 'asc' },
        });
        const bySymbol = new Map();
        for (const op of operations) {
            const data = bySymbol.get(op.symbol) ?? {
                name: op.assetName,
                type: op.assetType,
                buys: [],
                sells: 0,
            };
            if (op.operationType === 'buy') {
                data.buys.push({
                    quantity: Number(op.quantity),
                    unitPrice: Number(op.unitPrice),
                });
            }
            else {
                data.sells += Number(op.quantity);
            }
            bySymbol.set(op.symbol, data);
        }
        const positions = Array.from(bySymbol.entries())
            .map(([symbol, data]) => {
            const boughtQty = data.buys.reduce((acc, item) => acc + item.quantity, 0);
            const quantity = boughtQty - data.sells;
            if (quantity <= 0 || boughtQty <= 0) {
                return null;
            }
            const investedOnBuys = data.buys.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
            const averagePrice = investedOnBuys / boughtQty;
            const investedAmount = quantity * averagePrice;
            const lastBuy = data.buys[data.buys.length - 1];
            const currentPrice = lastBuy?.unitPrice ?? averagePrice;
            const currentValue = quantity * currentPrice;
            const profitLoss = currentValue - investedAmount;
            const profitLossPercent = investedAmount > 0 ? (profitLoss / investedAmount) * 100 : 0;
            return {
                symbol,
                name: data.name,
                type: data.type,
                quantity: Number(quantity.toFixed(6)),
                averagePrice: Number(averagePrice.toFixed(4)),
                investedAmount: Number(investedAmount.toFixed(2)),
                currentPrice: Number(currentPrice.toFixed(4)),
                currentValue: Number(currentValue.toFixed(2)),
                profitLoss: Number(profitLoss.toFixed(2)),
                profitLossPercent: Number(profitLossPercent.toFixed(2)),
                allocationPercent: 0,
            };
        })
            .filter((item) => item !== null);
        const totalCurrentValue = positions.reduce((acc, position) => acc + position.currentValue, 0);
        for (const position of positions) {
            position.allocationPercent =
                totalCurrentValue > 0
                    ? Number(((position.currentValue / totalCurrentValue) * 100).toFixed(2))
                    : 0;
        }
        const distribution = positions
            .map((position) => ({
            symbol: position.symbol,
            name: position.name,
            type: position.type,
            currentValue: position.currentValue,
            allocationPercent: position.allocationPercent,
        }))
            .sort((a, b) => b.allocationPercent - a.allocationPercent);
        const totalInvested = positions.reduce((acc, position) => acc + position.investedAmount, 0);
        const currentValue = positions.reduce((acc, position) => acc + position.currentValue, 0);
        const totalProfitLoss = currentValue - totalInvested;
        const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
        const topPerformer = [...positions].sort((a, b) => b.profitLossPercent - a.profitLossPercent)[0];
        const worstPerformer = [...positions].sort((a, b) => a.profitLossPercent - b.profitLossPercent)[0];
        const largestAllocation = [...positions].sort((a, b) => b.allocationPercent - a.allocationPercent)[0];
        return {
            positions,
            summary: {
                totalInvested: Number(totalInvested.toFixed(2)),
                currentValue: Number(currentValue.toFixed(2)),
                totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
                totalProfitLossPercent: Number(totalProfitLossPercent.toFixed(2)),
                totalAssets: positions.length,
                topPerformer: topPerformer
                    ? {
                        symbol: topPerformer.symbol,
                        name: topPerformer.name,
                        profitLossPercent: topPerformer.profitLossPercent,
                    }
                    : null,
                worstPerformer: worstPerformer
                    ? {
                        symbol: worstPerformer.symbol,
                        name: worstPerformer.name,
                        profitLossPercent: worstPerformer.profitLossPercent,
                    }
                    : null,
                largestAllocation: largestAllocation
                    ? {
                        symbol: largestAllocation.symbol,
                        name: largestAllocation.name,
                        allocationPercent: largestAllocation.allocationPercent,
                    }
                    : null,
            },
            distribution,
        };
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map