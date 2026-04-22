import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @TenantId() tenantId: string,
  ): Promise<{
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      tenantId: string;
    };
  }> {
    return this.authService.login(loginDto, tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(): void {
    return undefined;
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me')
  async me(
    @CurrentUser()
    user: {
      id: string;
      tenantId: string;
    },
  ): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
  }> {
    return this.authService.me(user.id, user.tenantId);
  }
}
