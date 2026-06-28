import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';

interface OnboardResponse {
  accessToken: string;
  refreshToken: string;
  tenant: {
    id: string;
    slug: string;
  };
}

interface ContractResponse {
  id: string;
  status: string;
  fieldValues: unknown[];
}

interface HistoryResponse {
  oldValue: string | null;
  newValue: string | null;
}

describe('Executiva Contracts (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let contractId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.contractHistory.deleteMany({
      where: { contract: { tenant: { slug: 'empresa-e2e' } } },
    });
    await prisma.contractFieldValue.deleteMany({
      where: { contract: { tenant: { slug: 'empresa-e2e' } } },
    });
    await prisma.contract.deleteMany({
      where: { tenant: { slug: 'empresa-e2e' } },
    });
    await prisma.templateField.deleteMany({
      where: { template: { tenant: { slug: 'empresa-e2e' } } },
    });
    await prisma.contractTemplate.deleteMany({
      where: { tenant: { slug: 'empresa-e2e' } },
    });
    await prisma.user.deleteMany({
      where: { tenant: { slug: 'empresa-e2e' } },
    });
    await prisma.tenant.deleteMany({ where: { slug: 'empresa-e2e' } });
    await app.close();
  });

  it('POST /api/tenants/onboard - create tenants and return tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tenants/onboard')
      .send({
        tenantName: 'Empresa E2E',
        adminName: 'Admin E2E',
        adminEmail: 'admin@e2e.com',
        adminPassword: '123456',
      })
      .expect(201);

    const body = res.body as OnboardResponse;

    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.tenant).toHaveProperty('slug', 'empresa-e2e');

    accessToken = body.accessToken;
  });

  it('POST /api/auth/login - return tokens with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@e2e.com', password: '123456' })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /api/auth/login - return 401 with invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@e2e.com', password: 'senhaerrada' })
      .expect(401);
  });

  it('PUT /api/template/fields + POST /api/contracts - full contract flow', async () => {
    await request(app.getHttpServer())
      .put('/api/template/fields')
      .set('Authorization', `Bearer ${accessToken}`)
      .send([
        { name: 'Cliente', type: 'TEXT', required: true, order: 0 },
        { name: 'Valor', type: 'NUMBER', required: true, order: 1 },
      ])
      .expect(200);

    const res = await request(app.getHttpServer())
      .post('/api/contracts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fields: [
          { name: 'Cliente', value: 'João E2E' },
          { name: 'Valor', value: '1000' },
        ],
      })
      .expect(201);

    const body = res.body as ContractResponse;

    expect(body).toHaveProperty('id');
    expect(body.status).toBe('DRAFT');
    expect(body.fieldValues).toHaveLength(2);

    contractId = body.id;
  });

  it('PATCH /api/contracts/:id/status + GET /api/contracts/:id/history - correct history/logs', async () => {
    await request(app.getHttpServer())
      .patch(`/api/contracts/${contractId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'ACTIVE' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/api/contracts/${contractId}/history`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = res.body as HistoryResponse[];

    expect(body.length).toBeGreaterThanOrEqual(2);

    const statusChange = body.find(
      (h) => h.oldValue === 'DRAFT' && h.newValue === 'ACTIVE',
    );

    expect(statusChange).toBeDefined();
  });
});
