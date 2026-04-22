import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Get(':id/config')
  async getTenantConfig(@Param('id') id: string): Promise<unknown> {
    return this.tenantsService.getTenantConfigById(id);
  }
}
