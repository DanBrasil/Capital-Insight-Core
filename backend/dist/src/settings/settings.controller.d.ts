import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getProfile(user: {
        tenantId: string;
        id: string;
    }): Promise<{
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
    updateProfile(user: {
        tenantId: string;
        id: string;
    }, payload: UpdateProfileDto): Promise<{
        name: string;
        email: string;
        locale: string;
        currency: string;
    }>;
    updatePreferences(user: {
        tenantId: string;
        id: string;
    }, payload: UpdatePreferencesDto): Promise<Record<string, unknown>>;
    changePassword(user: {
        tenantId: string;
        id: string;
    }, payload: ChangePasswordDto): Promise<void>;
    updatePlatform(user: {
        tenantId: string;
        id: string;
    }, payload: UpdatePlatformDto): Promise<Record<string, unknown>>;
}
