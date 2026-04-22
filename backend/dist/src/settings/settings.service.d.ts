import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getOrCreateSettings;
    getProfile(tenantId: string, userId: string): Promise<{
        profile: {
            name: string;
            email: string;
            locale: string;
            currency: string;
        };
        preferences: {
            theme: string;
            dateFormat: string;
            currencyFormat: string;
        };
        security: {
            canChangePassword: boolean;
        };
        platform: {
            showPortfolioHighlights: boolean;
            allowAIInsights: boolean;
            defaultMarketView: string;
        };
    }>;
    updateProfile(tenantId: string, userId: string, payload: UpdateProfileDto): Promise<{
        name: string;
        email: string;
        locale: string;
        currency: string;
    }>;
    updatePreferences(tenantId: string, userId: string, payload: UpdatePreferencesDto): Promise<Record<string, unknown>>;
    changePassword(tenantId: string, userId: string, payload: ChangePasswordDto): Promise<void>;
    updatePlatform(tenantId: string, userId: string, payload: UpdatePlatformDto): Promise<Record<string, unknown>>;
}
