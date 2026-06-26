import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { FilterContractDto } from './dto/filter-contract.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query() filters: FilterContractDto) {
    return this.contractService.findAll(user.tenantId, filters);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.contractService.findOne(id, user.tenantId);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@CurrentUser() user: User, @Body() dto: CreateContractDto) {
    return this.contractService.create(user.tenantId, user.id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateContractStatusDto,
  ) {
    return this.contractService.updateStatus(id, user.tenantId, user.id, dto);
  }
}
