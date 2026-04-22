import type { Tenant } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTenantConfigById(id: string): Promise<Record<string, unknown>>;
    findTenantById(id: string): Promise<Tenant | null>;
}
