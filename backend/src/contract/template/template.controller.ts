import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateFieldDto } from '../dto/create-template-field.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@Controller('template')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplateController {
  constructor(private templateService: TemplateService) {}

  @Get()
  get(@CurrentUser() user: User) {
    return this.templateService.getOrCreate(user.tenantId);
  }

  @Put('fields')
  @Roles(Role.ADMIN)
  updateFields(
    @CurrentUser() user: User,
    @Body() fields: CreateTemplateFieldDto[],
  ) {
    return this.templateService.updateFields(user.tenantId, fields);
  }
}
