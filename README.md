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

| Perfil | E-mail | Senha | Empresa (Tenant) |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@alpha.com` | `123456` | Escritório Alpha |
| **Viewer** | `viewer@alpha.com` | `123456` | Escritório Alpha |
| **Admin** | `admin@beta.com` | `123456` | Advocacia Beta |

---

## Resumo das Decisões Técnicas

- **Next.js:** Escolhi focar no ecossistema do Next.js para construir o frontend e consumir a API (Obs: A especificação mencionava Next.js e Vite como obrigatórios, mas como o Next.js já possui seu próprio bundler interno Webpack/Turbopack, o uso do Vite se torna redundante nesta stack, então optei por seguir o padrão oficial do framework).
- **Isolamento de Dados (Multi-tenant):** Cada usuário está vinculado a um `tenantId`. A API verifica isso no token JWT e filtra nas consultas do Prisma, garantindo que um usuário não veja os contratos de outra empresa.
- **Contratos e Templates:** Para não afetar contratos antigos se um template mudar no futuro, o sistema cria um snapshot dos campos do template e salva em formato JSON dentro do contrato no momento da criação.
- **Histórico de Alterações:** Toda vez que um contrato é criado, editado ou muda de status, a API salva um registro na tabela `ContractHistory` mostrando os valores alterados.
- **Simplificações do Teste:** O refresh token é gerado normalmente pelo backend, mas não implementei a lógica de renovação automática (interceptor) no frontend. Também não criei um versionamento de templates para avisar o usuário se um contrato usa um modelo muito antigo.

---

## Scripts Úteis

```bash
cd /backend
npm run test:e2e
npm run build

cd /frontend
npm run build
```
