# Executiva Contracts

SaaS multi-tenant para gestão de contratos com NestJS, Prisma/PostgreSQL e frontend Next.js.

## Como rodar

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api
- Healthcheck: http://localhost:3001/api/health

## Seed

O container da API executa `prisma migrate deploy` e `prisma db seed` ao iniciar.

Credenciais:

| Perfil | E-mail | Senha | Tenant |
| --- | --- | --- | --- |
| Admin | admin@alpha.com | 123456 | Escritório Alpha |
| Viewer | viewer@alpha.com | 123456 | Escritório Alpha |
| Admin | admin@beta.com | 123456 | Advocacia Beta |

Seed inclui 2 tenants, 3 usuários, templates e 5 contratos.

## Scripts uteis

```bash
cd backend && npm run test:e2e
cd backend && npm run build
cd frontend && npm run build
```

## Decisoes tecnicas

- Multi-tenancy por `tenantId` em usuários, templates, contratos e histórico.
- JWT access token + refresh token; guards de auth e RBAC para Admin/Viewer.
- Template salvo por tenant; contratos copiam campos no momento da criação para não alterar histórico retroativamente.
- Histórico registra criação, edição de campos e mudança de status.
- Docker Compose sobe banco, API e frontend em um único comando.
