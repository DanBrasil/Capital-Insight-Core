import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: { tenantId: string };
      tenant?: unknown;
    }>();

    const tenantIdHeader = request.headers['x-tenant-id'];
    const tenantId = Array.isArray(tenantIdHeader)
      ? tenantIdHeader[0]
      : tenantIdHeader;

    if (!tenantId) {
      throw new ForbiddenException('Tenant invalido ou inativo.');
    }

    if (request.user && request.user.tenantId !== tenantId) {
      throw new ForbiddenException('Tenant invalido ou inativo.');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.isActive) {
      throw new ForbiddenException('Tenant invalido ou inativo.');
    }

    request.tenant = {
      id: tenant.id,
      name: tenant.name,
      isActive: tenant.isActive,
      config: (tenant.config as { features?: string[] }) ?? {},
    };

    return true;
  }
}
