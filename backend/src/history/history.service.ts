import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface LogParams {
  contractId: string;
  changedBy: string;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
}

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async log(params: LogParams) {
    return this.prisma.contractHistory.create({ data: params });
  }

  async findByContract(contractId: string, tenantId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, tenantId },
    });
    if (!contract) return [];

    return this.prisma.contractHistory.findMany({
      where: { contractId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { changedAt: 'desc' },
    });
  }
}
