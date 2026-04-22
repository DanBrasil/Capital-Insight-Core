"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? '12');
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@demo.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
    const passwordHash = await (0, bcryptjs_1.hash)(adminPassword, rounds);
    const defaultTenantConfig = {
        id: 'default',
        name: 'White Label Finance',
        theme: {
            colorPrimary: '#2563eb',
            colorPrimaryForeground: '#ffffff',
            colorSecondary: '#64748b',
            colorSecondaryForeground: '#ffffff',
            colorBackground: '#ffffff',
            colorForeground: '#0f172a',
            colorMuted: '#f8fafc',
            colorMutedForeground: '#64748b',
            colorBorder: '#e2e8f0',
            logoUrl: '/logo.svg',
            fontFamily: 'Inter, system-ui, sans-serif',
        },
        features: [
            'notifications',
            'export-csv',
            'portfolio',
            'operations',
            'ai-insights',
            'reports',
        ],
        appConfig: {
            currencyCode: 'BRL',
            locale: 'pt-BR',
            supportEmail: 'suporte@wlfinance.com.br',
        },
    };
    const acmeTenantConfig = {
        id: 'acme',
        name: 'Acme Capital',
        theme: {
            colorPrimary: '#0f766e',
            colorPrimaryForeground: '#ffffff',
            colorSecondary: '#334155',
            colorSecondaryForeground: '#ffffff',
            colorBackground: '#f8fafc',
            colorForeground: '#0f172a',
            colorMuted: '#e2e8f0',
            colorMutedForeground: '#334155',
            colorBorder: '#cbd5e1',
            logoUrl: '/acme-logo.svg',
            fontFamily: 'Inter, system-ui, sans-serif',
        },
        features: ['portfolio', 'operations', 'reports'],
        appConfig: {
            currencyCode: 'BRL',
            locale: 'pt-BR',
            supportEmail: 'contato@acme.com.br',
        },
    };
    await prisma.tenant.upsert({
        where: { id: 'default' },
        update: {
            name: 'White Label Finance',
            isActive: true,
            config: defaultTenantConfig,
        },
        create: {
            id: 'default',
            name: 'White Label Finance',
            isActive: true,
            config: defaultTenantConfig,
        },
    });
    await prisma.tenant.upsert({
        where: { id: 'acme' },
        update: {
            name: 'Acme Capital',
            isActive: true,
            config: acmeTenantConfig,
        },
        create: {
            id: 'acme',
            name: 'Acme Capital',
            isActive: true,
            config: acmeTenantConfig,
        },
    });
    const adminUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: 'default',
                email: adminEmail,
            },
        },
        update: {
            name: 'Admin Demo',
            passwordHash,
            role: 'admin',
        },
        create: {
            tenantId: 'default',
            name: 'Admin Demo',
            email: adminEmail,
            passwordHash,
            role: 'admin',
        },
    });
    await prisma.userSettings.upsert({
        where: {
            tenantId_userId: {
                tenantId: 'default',
                userId: adminUser.id,
            },
        },
        update: {},
        create: {
            tenantId: 'default',
            userId: adminUser.id,
            profile: { locale: 'pt-BR', currency: 'BRL' },
            preferences: {
                theme: 'system',
                dateFormat: 'dd/MM/yyyy',
                currencyFormat: 'BRL',
            },
            platform: {
                showPortfolioHighlights: true,
                allowAIInsights: true,
                defaultMarketView: 'list',
            },
        },
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map