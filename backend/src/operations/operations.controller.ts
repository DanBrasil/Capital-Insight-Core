import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Feature } from '../common/decorators/feature.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CreateOperationDto } from './dto/create-operation.dto';
import { OperationFiltersDto } from './dto/operation-filters.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { OperationsService } from './operations.service';

@Feature('operations')
@UseGuards(JwtAuthGuard, TenantGuard, FeatureGuard, RolesGuard)
@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: { tenantId: string; id: string },
    @Query() filters: OperationFiltersDto,
  ) {
    return this.operationsService.findAll(user.tenantId, user.id, filters);
  }

  @Roles('admin', 'manager')
  @Post()
  async create(
    @CurrentUser() user: { tenantId: string; id: string },
    @Body() payload: CreateOperationDto,
  ) {
    return this.operationsService.create(user.tenantId, user.id, payload);
  }

  @Roles('admin', 'manager')
  @Put(':id')
  async update(
    @CurrentUser() user: { tenantId: string; id: string },
    @Param('id') id: string,
    @Body() payload: UpdateOperationDto,
  ) {
    return this.operationsService.update(user.tenantId, user.id, id, payload);
  }

  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @CurrentUser() user: { tenantId: string; id: string },
    @Param('id') id: string,
  ): Promise<void> {
    return this.operationsService.remove(user.tenantId, user.id, id);
  }
}
