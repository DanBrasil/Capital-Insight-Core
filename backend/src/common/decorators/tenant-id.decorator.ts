import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const tenantId = request.headers['x-tenant-id'];
    if (Array.isArray(tenantId)) {
      return tenantId[0] ?? 'default';
    }
    return tenantId ?? 'default';
  },
);
