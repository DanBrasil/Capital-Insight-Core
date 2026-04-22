import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateSettings(tenantId: string, userId: string) {
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

  async getProfile(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({ where: { tenantId, id: userId } });

    if (!user) {
      throw new UnauthorizedException('Sessao expirada. Faca login novamente.');
    }

    const settings = await this.getOrCreateSettings(tenantId, userId);

    const profileData = (settings.profile as Record<string, unknown>) ?? {};
    const preferences = (settings.preferences as Record<string, unknown>) ?? {};
    const platform = (settings.platform as Record<string, unknown>) ?? {};

    return {
      profile: {
        name: user.name,
        email: user.email,
        locale: (profileData.locale as string) ?? 'pt-BR',
        currency: (profileData.currency as string) ?? 'BRL',
      },
      preferences: {
        theme: (preferences.theme as string) ?? 'system',
        dateFormat: (preferences.dateFormat as string) ?? 'dd/MM/yyyy',
        currencyFormat: (preferences.currencyFormat as string) ?? 'BRL',
      },
      security: {
        canChangePassword: Boolean(user.passwordHash),
      },
      platform: {
        showPortfolioHighlights:
          (platform.showPortfolioHighlights as boolean) ?? true,
        allowAIInsights: (platform.allowAIInsights as boolean) ?? true,
        defaultMarketView: (platform.defaultMarketView as string) ?? 'list',
      },
    };
  }

  async updateProfile(
    tenantId: string,
    userId: string,
    payload: UpdateProfileDto,
  ) {
    if (payload.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          tenantId,
          email: payload.email,
          id: { not: userId },
        },
      });

      if (existingEmail) {
        throw new ConflictException({
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
    const profile = (settings.profile as Record<string, unknown>) ?? {};

    profile.locale = payload.locale ?? (profile.locale as string) ?? 'pt-BR';
    profile.currency = payload.currency ?? (profile.currency as string) ?? 'BRL';

    await this.prisma.userSettings.update({
      where: { tenantId_userId: { tenantId, userId } },
      data: { profile: profile as Prisma.InputJsonValue },
    });

    const user = await this.prisma.user.findFirst({ where: { tenantId, id: userId } });

    return {
      name: user?.name ?? payload.name ?? '',
      email: user?.email ?? payload.email ?? '',
      locale: profile.locale as string,
      currency: profile.currency as string,
    };
  }

  async updatePreferences(
    tenantId: string,
    userId: string,
    payload: UpdatePreferencesDto,
  ) {
    const settings = await this.getOrCreateSettings(tenantId, userId);
    const preferences = (settings.preferences as Record<string, unknown>) ?? {};

    if (payload.theme) preferences.theme = payload.theme;
    if (payload.dateFormat) preferences.dateFormat = payload.dateFormat;
    if (payload.currencyFormat) preferences.currencyFormat = payload.currencyFormat;

    await this.prisma.userSettings.update({
      where: { tenantId_userId: { tenantId, userId } },
      data: { preferences: preferences as Prisma.InputJsonValue },
    });

    return preferences;
  }

  async changePassword(
    tenantId: string,
    userId: string,
    payload: ChangePasswordDto,
  ): Promise<void> {
    if (payload.newPassword.length < 8) {
      throw new BadRequestException('Senha muito fraca.');
    }

    const user = await this.prisma.user.findFirst({ where: { tenantId, id: userId } });
    if (!user) {
      throw new UnauthorizedException('Sessao expirada. Faca login novamente.');
    }

    const validCurrentPassword = await compare(
      payload.currentPassword,
      user.passwordHash,
    );

    if (!validCurrentPassword) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS ?? '12');
    const passwordHash = await hash(payload.newPassword, rounds);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }

  async updatePlatform(
    tenantId: string,
    userId: string,
    payload: UpdatePlatformDto,
  ) {
    const settings = await this.getOrCreateSettings(tenantId, userId);
    const platform = (settings.platform as Record<string, unknown>) ?? {};

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
      data: { platform: platform as Prisma.InputJsonValue },
    });

    return platform;
  }
}
