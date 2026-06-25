import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async onboard(dto: CreateTenantDto) {
    const slug = dto.tenantName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Tenant já existente');

    const tenant = await this.prisma.tenant.create({
      data: { name: dto.tenantName, slug },
    });

    const tokens = await this.authService.register(
      {
        name: dto.adminName,
        email: dto.adminEmail,
        password: dto.adminPassword,
      },
      tenant.id,
      Role.ADMIN,
    );

    return { tenant, ...tokens };
  }
}
