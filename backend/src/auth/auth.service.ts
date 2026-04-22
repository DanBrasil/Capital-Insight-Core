import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from '../common/types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, tenantId: string): Promise<{
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      tenantId: string;
    };
  }> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant || !tenant.isActive) {
      throw new ForbiddenException('Tenant invalido ou inativo.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha invalidos.');
    }

    const validPassword = await compare(loginDto.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedException('Email ou senha invalidos.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as JwtPayload['role'],
      tenantId: user.tenantId,
    };

    return {
      token: await this.jwtService.signAsync(payload, {
        expiresIn:
          (this.configService.get<string>('JWT_EXPIRES_IN') ?? '24h') as StringValue,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async me(userId: string, tenantId: string): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
  }> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sessao expirada. Faca login novamente.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
