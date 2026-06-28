import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryService } from '../history/history.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { FilterContractDto } from './dto/filter-contract.dto';
import { FieldType } from '@prisma/client';
import type { ContractStatus } from '@prisma/client';
import { UpdateContractFieldsDto } from './dto/update-contract-fields.dto';

interface WhereQuery {
  tenantId: string;
  status?: ContractStatus;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  fieldValues?: {
    some?: object;
  };
}

@Injectable()
export class ContractService {
  constructor(
    private prisma: PrismaService,
    private history: HistoryService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateContractDto) {
    const template = await this.prisma.contractTemplate.findUnique({
      where: { tenantId },
      include: { fields: true },
    });

    if (!template || template.fields.length === 0) {
      throw new BadRequestException(
        'Configure o template antes de criar contratos',
      );
    }

    for (const field of template.fields) {
      const input = dto.fields.find((f) => f.name === field.name);

      if (
        field.required &&
        (!input ||
          input.value === null ||
          input.value === '' ||
          input.value.trim() === '')
      )
        throw new BadRequestException(
          `Campo obrigatório ausente: ${field.name}`,
        );

      if (input?.value) {
        this.validateFieldType(field.type, input.value, field.name);
      }
    }

    const contract = await this.prisma.contract.create({
      data: {
        tenantId,
        templateId: template.id,
        fieldValues: {
          create: template.fields.map((field) => ({
            fieldName: field.name,
            fieldType: field.type,
            required: field.required,
            value: dto.fields.find((f) => f.name === field.name)?.value ?? null,
          })),
        },
      },

      include: { fieldValues: true },
    });

    await this.history.log({
      contractId: contract.id,
      changedBy: userId,
      field: 'status',
      oldValue: null,
      newValue: 'DRAFT',
    });

    return contract;
  }

  async updateFields(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateContractFieldsDto,
  ) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, tenantId },
      include: { fieldValues: true },
    });

    if (!contract) throw new NotFoundException('Contrato não encontrado');

    if (contract.status !== 'DRAFT') {
      throw new BadRequestException(
        'Apenas contratos em rascunho podem ser editados',
      );
    }

    const template = await this.prisma.contractTemplate.findUnique({
      where: { tenantId },
      include: { fields: true },
    });

    for (const input of dto.fields) {
      const templateField = template?.fields.find((f) => f.name === input.name);
      if (templateField && input.value) {
        this.validateFieldType(templateField.type, input.value, input.name);
      }
    }

    for (const input of dto.fields) {
      const existing = contract.fieldValues.find(
        (f) => f.fieldName === input.name,
      );
      if (!existing) continue;

      const oldValue = existing.value;
      const newValue = input.value ?? null;

      if (oldValue === newValue) continue;

      await this.prisma.contractFieldValue.update({
        where: { id: existing.id },
        data: { value: newValue },
      });

      await this.history.log({
        contractId: id,
        changedBy: userId,
        field: input.name,
        oldValue,
        newValue,
      });
    }

    return this.findOne(id, tenantId);
  }

  async updateStatus(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateContractStatusDto,
  ) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, tenantId },
    });
    if (!contract) throw new NotFoundException('Contrato não encontrado');

    const updated = await this.prisma.contract.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.history.log({
      contractId: id,
      changedBy: userId,
      field: 'status',
      oldValue: contract.status,
      newValue: dto.status,
    });

    return updated;
  }

  async findAll(tenantId: string, filters: FilterContractDto) {
    const {
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const where: WhereQuery = { tenantId };

    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(`${startDate}T00:00:00`);
      }
      if (endDate) {
        where.createdAt.lte = new Date(`${endDate}T23:59:59.999`);
      }
    }

    if (search) {
      where.fieldValues = {
        some: { value: { contains: search, mode: 'insensitive' } },
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contract.findMany({
        where,
        include: { fieldValues: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, tenantId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, tenantId },
      include: { fieldValues: true },
    });
    if (!contract) throw new NotFoundException('Contrato não encontrado');
    return contract;
  }

  private validateFieldType(type: FieldType, value: string, fieldName: string) {
    if (type === FieldType.NUMBER && isNaN(Number(value)))
      throw new BadRequestException(`Campo "${fieldName}" deve ser um número`);

    if (type === FieldType.DATE && isNaN(Date.parse(value)))
      throw new BadRequestException(
        `Campo "${fieldName}" deve ser uma data válida`,
      );

    if (
      type === FieldType.BOOLEAN &&
      !['true', 'false'].includes(value.toLowerCase())
    )
      throw new BadRequestException(
        `Campo "${fieldName}" deve ser verdadeiro ou falso`,
      );
  }
}
