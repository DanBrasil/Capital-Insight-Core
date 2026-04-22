import { Injectable, NotFoundException } from '@nestjs/common';
import type { Tenant } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTenantConfigById(id: string): Promise<Record<string, unknown>> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });

    if (!tenant || !tenant.isActive) {
      throw new NotFoundException('Tenant nao encontrado.');
    }

    const config = (tenant.config as Record<string, unknown>) ?? {};

    return {
      id: tenant.id,
      name: tenant.name,
      ...config,
    };
  }

  async findTenantById(id: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({ where: { id } });
  }
}
