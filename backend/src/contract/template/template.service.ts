import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateFieldDto } from '../dto/create-template-field.dto';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async getOrCreate(tenantId: string) {
    let template = await this.prisma.contractTemplate.findUnique({
      where: { tenantId },
      include: { fields: { orderBy: { order: 'asc' } } },
    });

    if (!template) {
      template = await this.prisma.contractTemplate.create({
        data: { tenantId },
        include: { fields: { orderBy: { order: 'asc' } } },
      });
    }

    return template;
  }

  async updateFields(tenantId: string, fields: CreateTemplateFieldDto[]) {
    const template = await this.getOrCreate(tenantId);

    await this.prisma.templateField.deleteMany({
      where: { templateId: template.id },
    });

    await this.prisma.templateField.createMany({
      data: fields.map((f, i) => ({
        templateId: template.id,
        name: f.name,
        type: f.type,
        required: f.required ?? false,
        order: f.order ?? i,
      })),
    });

    return this.getOrCreate(tenantId);
  }
}
