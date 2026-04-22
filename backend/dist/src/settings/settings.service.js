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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const bcryptjs_1 = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateSettings(tenantId, userId) {
        const settings = await this.prisma.userSettings.upsert({
            where: { tenantId_userId: { tenantId, userId } },
            update: {},
            create: {
                tenantId,
                userId,
                profile: {},
                preferences: {},
                platform: {},
            },
        });
        return settings;
    }
    async getProfile(tenantId, userId) {
        const user = await this.prisma.user.findFirst({ where: { tenantId, id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('Sessao expirada. Faca login novamente.');
        }
        const settings = await this.getOrCreateSettings(tenantId, userId);
        const profileData = settings.profile ?? {};
        const preferences = settings.preferences ?? {};
        const platform = settings.platform ?? {};
        return {
            profile: {
                name: user.name,
                email: user.email,
                locale: profileData.locale ?? 'pt-BR',
                currency: profileData.currency ?? 'BRL',
            },
            preferences: {
                theme: preferences.theme ?? 'system',
                dateFormat: preferences.dateFormat ?? 'dd/MM/yyyy',
                currencyFormat: preferences.currencyFormat ?? 'BRL',
            },
            security: {
                canChangePassword: Boolean(user.passwordHash),
            },
            platform: {
                showPortfolioHighlights: platform.showPortfolioHighlights ?? true,
                allowAIInsights: platform.allowAIInsights ?? true,
                defaultMarketView: platform.defaultMarketView ?? 'list',
            },
        };
    }
    async updateProfile(tenantId, userId, payload) {
        if (payload.email) {
            const existingEmail = await this.prisma.user.findFirst({
                where: {
                    tenantId,
                    email: payload.email,
                    id: { not: userId },
                },
            });
            if (existingEmail) {
                throw new common_1.ConflictException({
                    message: "O campo email ja esta em uso.",
                    field: 'email',
                    code: 'CONFLICT',
                });
            }
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: payload.name,
                email: payload.email,
            },
        });
        const settings = await this.getOrCreateSettings(tenantId, userId);
        const profile = settings.profile ?? {};
        profile.locale = payload.locale ?? profile.locale ?? 'pt-BR';
        profile.currency = payload.currency ?? profile.currency ?? 'BRL';
        await this.prisma.userSettings.update({
            where: { tenantId_userId: { tenantId, userId } },
            data: { profile: profile },
        });
        const user = await this.prisma.user.findFirst({ where: { tenantId, id: userId } });
        return {
            name: user?.name ?? payload.name ?? '',
            email: user?.email ?? payload.email ?? '',
            locale: profile.locale,
            currency: profile.currency,
        };
    }
    async updatePreferences(tenantId, userId, payload) {
        const settings = await this.getOrCreateSettings(tenantId, userId);
        const preferences = settings.preferences ?? {};
        if (payload.theme)
            preferences.theme = payload.theme;
        if (payload.dateFormat)
            preferences.dateFormat = payload.dateFormat;
        if (payload.currencyFormat)
            preferences.currencyFormat = payload.currencyFormat;
        await this.prisma.userSettings.update({
            where: { tenantId_userId: { tenantId, userId } },
            data: { preferences: preferences },
        });
        return preferences;
    }
    async changePassword(tenantId, userId, payload) {
        if (payload.newPassword.length < 8) {
            throw new common_1.BadRequestException('Senha muito fraca.');
        }
        const user = await this.prisma.user.findFirst({ where: { tenantId, id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('Sessao expirada. Faca login novamente.');
        }
        const validCurrentPassword = await (0, bcryptjs_1.compare)(payload.currentPassword, user.passwordHash);
        if (!validCurrentPassword) {
            throw new common_1.UnauthorizedException('Senha atual incorreta.');
        }
        const rounds = Number(process.env.BCRYPT_ROUNDS ?? '12');
        const passwordHash = await (0, bcryptjs_1.hash)(payload.newPassword, rounds);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });
    }
    async updatePlatform(tenantId, userId, payload) {
        const settings = await this.getOrCreateSettings(tenantId, userId);
        const platform = settings.platform ?? {};
        if (payload.showPortfolioHighlights !== undefined) {
            platform.showPortfolioHighlights = payload.showPortfolioHighlights;
        }
        if (payload.allowAIInsights !== undefined) {
            platform.allowAIInsights = payload.allowAIInsights;
        }
        if (payload.defaultMarketView) {
            platform.defaultMarketView = payload.defaultMarketView;
        }
        await this.prisma.userSettings.update({
            where: { tenantId_userId: { tenantId, userId } },
            data: { platform: platform },
        });
        return platform;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map