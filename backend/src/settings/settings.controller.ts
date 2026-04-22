import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SettingsService } from './settings.service';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: { tenantId: string; id: string }) {
    return this.settingsService.getProfile(user.tenantId, user.id);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: { tenantId: string; id: string },
    @Body() payload: UpdateProfileDto,
  ) {
    return this.settingsService.updateProfile(user.tenantId, user.id, payload);
  }

  @Patch('preferences')
  async updatePreferences(
    @CurrentUser() user: { tenantId: string; id: string },
    @Body() payload: UpdatePreferencesDto,
  ) {
    return this.settingsService.updatePreferences(user.tenantId, user.id, payload);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password')
  async changePassword(
    @CurrentUser() user: { tenantId: string; id: string },
    @Body() payload: ChangePasswordDto,
  ): Promise<void> {
    return this.settingsService.changePassword(user.tenantId, user.id, payload);
  }

  @Roles('admin')
  @Patch('platform')
  async updatePlatform(
    @CurrentUser() user: { tenantId: string; id: string },
    @Body() payload: UpdatePlatformDto,
  ) {
    return this.settingsService.updatePlatform(user.tenantId, user.id, payload);
  }
}
