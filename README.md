# Executiva Contracts - Desafio Técnico

Plataforma multi-tenant para gestão de contratos, desenvolvida para o processo seletivo com NestJS, Next.js, Prisma e PostgreSQL.

## Como rodar o projeto

Com o Docker instalado, abra o terminal na raiz do projeto e rode:

```bash
cp .env.example .env
docker compose up --build
```

O backend vai rodar as migrations e popular o banco com dados de teste (seed) automaticamente.

- **Frontend:** <http://localhost:3000>
- **API:** <http://localhost:3001/api>
- **Healthcheck:** <http://localhost:3001/api/health>

---

## Seed

O banco já sobe com 2 tenants e 5 contratos. Pode usar esses logins na tela inicial:

| Perfil | E-mail | Senha | Tenant |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@alpha.com` | `123456` | Escritório Alpha |
| **Viewer** | `viewer@alpha.com` | `123456` | Escritório Alpha |
| **Admin** | `admin@beta.com` | `123456` | Advocacia Beta |

---

## Resumo das Decisões Técnicas

- **Next.js:** A especificação mencionava Next.js e Vite como obrigatórios simultaneamente, o que é incompatível — Next.js possui bundler próprio (Webpack/Turbopack). Optei por seguir o padrão oficial do framework com Next.js 15 e App Router.
- **Isolamento de Dados (Multi-tenancy):** Adotei row-level tenancy — toda tabela relevante possui `tenantId`. A API valida o tenant via payload do JWT e injeta o filtro em todas as queries do Prisma, garantindo isolamento real entre empresas.
- **Contratos e Templates:** Ao criar um contrato, os campos do template ativo são copiados como `ContractFieldValue`, criando um snapshot imutável. Alterações futuras no template não afetam contratos já gerados.
- **Histórico de Alterações:** Toda criação, edição de campo ou mudança de status registra uma entrada em `ContractHistory` com campo, valor anterior, valor novo, usuário e timestamp.
- **Autenticação:** JWT com access token (15min) e refresh token (7d). No frontend os tokens são armazenados em localStorage — decisão pragmática para o escopo do teste. Em produção usaria httpOnly cookies para mitigar XSS.
- **Simplificações documentadas:** Renovação automática via refresh token não foi implementada no frontend (exigiria interceptor com fila de retry). Versionamento de templates também foi omitido por estar fora do escopo do teste.

## Testes

```bash
cd backend
npm run test:e2e
```

5 testes E2E cobrindo: onboarding, autenticação, fluxo completo de contrato e rastreabilidade do histórico.

## Scripts Úteis

```bash
# Backend
cd backend
npm run test:e2e
npm run build

# Frontend  
cd frontend
npm run build
```
