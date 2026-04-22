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
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: { tenantId: string; id: string },
    @Query() filters: TransactionFiltersDto,
  ) {
    return this.transactionsService.findAll(user.tenantId, user.id, filters);
  }

  @Roles('admin', 'manager')
  @Post()
  async create(
    @CurrentUser() user: { tenantId: string; id: string },
    @Body() payload: CreateTransactionDto,
  ) {
    return this.transactionsService.create(user.tenantId, user.id, payload);
  }

  @Roles('admin', 'manager')
  @Put(':id')
  async update(
    @CurrentUser() user: { tenantId: string; id: string },
    @Param('id') id: string,
    @Body() payload: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.tenantId, user.id, id, payload);
  }

  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @CurrentUser() user: { tenantId: string; id: string },
    @Param('id') id: string,
  ): Promise<void> {
    return this.transactionsService.remove(user.tenantId, user.id, id);
  }
}
