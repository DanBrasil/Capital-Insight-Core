import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURES_KEY } from '../decorators/feature.decorator';
import type { FeatureFlag } from '../types/auth.types';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeatures = this.reflector.getAllAndOverride<FeatureFlag[]>(
      FEATURES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeatures || requiredFeatures.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      tenant?: { config?: { features?: FeatureFlag[] } };
    }>();
    const tenantFeatures = request.tenant?.config?.features ?? [];

    const hasAllFeatures = requiredFeatures.every((feature) =>
      tenantFeatures.includes(feature),
    );

    if (!hasAllFeatures) {
      throw new ForbiddenException(
        'Este recurso nao esta disponivel para sua organizacao.',
      );
    }

    return true;
  }
}
