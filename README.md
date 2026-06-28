# Executiva Contracts - Desafio Técnico

Plataforma SaaS multi-tenant para gestão de contratos. Desenvolvida com NestJS, Next.js, Prisma e PostgreSQL, com foco no isolamento de dados e rastreabilidade.

## Como rodar o projeto

Certifique-se de ter o Docker instalado e rode os comandos abaixo na raiz do projeto:

```bash
cp .env.example .env
docker compose up --build -d
```

A inicialização do contêiner da API executa automaticamente o `prisma migrate deploy` e o `prisma db seed`.

- **Frontend:** <http://localhost:3000>
- **API Base:** <http://localhost:3001/api>
- **Healthcheck:** <http://localhost:3001/api/health>

---

## Seed

O banco já sobe populado com 2 tenants, templates estruturados e 5 contratos. Utilize os acessos abaixo:

| Perfil | E-mail | Senha | Tenant |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@alpha.com` | `123456` | Escritório Alpha |
| **Viewer** | `viewer@alpha.com` | `123456` | Escritório Alpha |
| **Admin** | `admin@beta.com` | `123456` | Advocacia Beta |

---

## Decisões Técnicas e Arquitetura

- **Next.js vs Vite:** A especificação citava ambos. Optei pelo Next.js (App Router) por seu ecossistema nativo e robustez, sendo a escolha ideal para escalar um SaaS.
- **Multi-tenancy Real:** O `tenantId` é extraído via JWT e injetado diretamente nas consultas do Prisma. Isso garante isolamento em nível de banco, prevenindo vazamento de dados entre empresas.
- **Imutabilidade de Contratos:** Para que edições no *Template* não afetem os contratos antigos, o sistema salva um *snapshot* (cópia estrutural no formato `Json`) do template no momento exato em que o contrato é gerado.
- **Auditoria / Histórico:** Qualquer mutação em um contrato (criação, edição de campos ou status) grava automaticamente um registro estruturado na tabela `AuditLog`, contendo o valor antigo e o novo.
- **Trade-offs (Escopo MVP):** Para focar nos requisitos core, o *refresh token* é gerado no backend, mas sem a lógica de renovação automática/interceptors no frontend. O controle de desatualização de templates exigiria versionamento (`v1`, `v2`), o que mantive fora desta versão.

---

## Scripts Úteis (Desenvolvimento Local)

```bash
# Testes E2E
cd apps/backend && npm run test:e2e

# Build
cd apps/backend && npm run build
cd apps/frontend && npm run build
```
