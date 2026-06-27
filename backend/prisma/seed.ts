import { PrismaClient, Role, ContractStatus, FieldType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed');

  //////////
  // Tenants
  const tenant1 = await prisma.tenant.create({
    data: { name: 'Escritório Alpha', slug: 'escritorio-alpha' },
  });

  const tenant2 = await prisma.tenant.create({
    data: { name: 'Advocacia Beta', slug: 'advocacia-beta' },
  });

  //////////
  // Users
  const hash = await bcrypt.hash('123456', 10);

  const admin1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: 'Admin Alpha',
      email: 'admin@alpha.com',
      passwordHash: hash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: 'Viewer Alpha',
      email: 'viewer@alpha.com',
      passwordHash: hash,
      role: Role.VIEWER,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      tenantId: tenant2.id,
      name: 'Admin Beta',
      email: 'admin@beta.com',
      passwordHash: hash,
      role: Role.ADMIN,
    },
  });

  //////////
  // Templates
  const template1 = await prisma.contractTemplate.create({
    data: {
      tenantId: tenant1.id,
      fields: {
        create: [
          {
            name: 'Nome do Cliente',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
          {
            name: 'Valor do Contrato',
            type: FieldType.NUMBER,
            required: true,
            order: 1,
          },
          {
            name: 'Data de Início',
            type: FieldType.DATE,
            required: false,
            order: 2,
          },
          {
            name: 'Ativo',
            type: FieldType.BOOLEAN,
            required: false,
            order: 3,
          },
        ],
      },
    },
    include: { fields: true },
  });

  const template2 = await prisma.contractTemplate.create({
    data: {
      tenantId: tenant2.id,
      fields: {
        create: [
          {
            name: 'Cliente',
            type: FieldType.TEXT,
            required: true,
            order: 0,
          },
          {
            name: 'Honorários',
            type: FieldType.NUMBER,
            required: true,
            order: 1,
          },
          {
            name: 'Prazo',
            type: FieldType.DATE,
            required: false,
            order: 2,
          },
        ],
      },
    },
    include: { fields: true },
  });

  //////////
  // Contracts Tenant 1 (3 contracts)
  const contractsT1 = [
    {
      fields: [
        { name: 'Nome do Cliente', value: 'João Silva' },
        { name: 'Valor do Contrato', value: '5000' },
        { name: 'Data de Início', value: '2026-01-10' },
        { name: 'Ativo', value: 'true' },
      ],
      status: ContractStatus.ACTIVE,
    },
    {
      fields: [
        { name: 'Nome do Cliente', value: 'Maria Souza' },
        { name: 'Valor do Contrato', value: '12000' },
        { name: 'Data de Início', value: '2026-02-15' },
        { name: 'Ativo', value: 'true' },
      ],
      status: ContractStatus.CLOSED,
    },
    {
      fields: [
        { name: 'Nome do Cliente', value: 'Carlos Oliveira' },
        { name: 'Valor do Contrato', value: '3500' },
        { name: 'Data de Início', value: '2026-03-01' },
        { name: 'Ativo', value: 'false' },
      ],
      status: ContractStatus.DRAFT,
    },
  ];

  for (const c of contractsT1) {
    const contract = await prisma.contract.create({
      data: {
        tenantId: tenant1.id,
        templateId: template1.id,
        status: c.status,
        fieldValues: {
          create: template1.fields.map((field) => ({
            fieldName: field.name,
            fieldType: field.type,
            required: field.required,
            value: c.fields.find((f) => f.name === field.name)?.value ?? null,
          })),
        },
      },
    });

    await prisma.contractHistory.create({
      data: {
        contractId: contract.id,
        changedBy: admin1.id,
        field: 'status',
        oldValue: null,
        newValue: 'DRAFT',
      },
    });

    if (c.status !== ContractStatus.DRAFT) {
      await prisma.contractHistory.create({
        data: {
          contractId: contract.id,
          changedBy: admin1.id,
          field: 'status',
          oldValue: 'DRAFT',
          newValue: c.status,
        },
      });
    }
  }

  //////////
  // Contracts Tenant 2 (2 contracts)
  const contractsT2 = [
    {
      fields: [
        { name: 'Cliente', value: 'Empresa XYZ' },
        { name: 'Honorários', value: '15000' },
        { name: 'Prazo', value: '2026-06-01' },
      ],
      status: ContractStatus.ACTIVE,
    },
    {
      fields: [
        { name: 'Cliente', value: 'Fernanda Lima' },
        { name: 'Honorários', value: '8000' },
        { name: 'Prazo', value: '2025-11-20' },
      ],
      status: ContractStatus.CLOSED,
    },
  ];

  for (const c of contractsT2) {
    const contract = await prisma.contract.create({
      data: {
        tenantId: tenant2.id,
        templateId: template2.id,
        status: c.status,
        fieldValues: {
          create: template2.fields.map((field) => ({
            fieldName: field.name,
            fieldType: field.type,
            required: field.required,
            value: c.fields.find((f) => f.name === field.name)?.value ?? null,
          })),
        },
      },
    });

    await prisma.contractHistory.create({
      data: {
        contractId: contract.id,
        changedBy: admin2.id,
        field: 'status',
        oldValue: null,
        newValue: 'DRAFT',
      },
    });

    await prisma.contractHistory.create({
      data: {
        contractId: contract.id,
        changedBy: admin2.id,
        field: 'status',
        oldValue: 'DRAFT',
        newValue: c.status,
      },
    });
  }

  console.log('Seed concluído');
  console.log('Credenciais de acesso:');
  console.log('- admin@alpha.com  / 123456 (Admin - Escritório Alpha)');
  console.log('- viewer@alpha.com / 123456 (Viewer - Escritório Alpha)');
  console.log('- admin@beta.com   / 123456 (Admin - Advocacia Beta)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
