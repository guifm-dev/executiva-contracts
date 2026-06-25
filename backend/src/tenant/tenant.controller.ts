import { Controller, Post, Body } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post('onboard')
  onboard(@Body() dto: CreateTenantDto) {
    return this.tenantService.onboard(dto);
  }
}
