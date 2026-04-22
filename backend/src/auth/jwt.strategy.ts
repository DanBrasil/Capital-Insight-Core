import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { FeatureFlag } from '../common/types/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../common/types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    role: JwtPayload['role'];
    tenantId: string;
  }> {
    const tenantIdHeader = req.headers['x-tenant-id'];
    const tenantId = Array.isArray(tenantIdHeader)
      ? tenantIdHeader[0]
      : tenantIdHeader;

    if (!tenantId || payload.tenantId !== tenantId) {
      throw new UnauthorizedException('Sessao expirada. Faca login novamente.');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.isActive) {
      throw new ForbiddenException('Tenant invalido ou inativo.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sessao expirada. Faca login novamente.');
    }

    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      isActive: tenant.isActive,
      config: (tenant.config as { features?: FeatureFlag[] }) ?? {},
    };

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as JwtPayload['role'],
      tenantId: user.tenantId,
    };
  }
}
