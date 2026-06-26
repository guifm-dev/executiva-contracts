import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('contracts/:contractId/history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  findByContract(
    @Param('contractId') contractId: string,
    @CurrentUser() user: User,
  ) {
    return this.historyService.findByContract(contractId, user.tenantId);
  }
}
