# Executiva Contracts

A multi-tenant contract management platform developed using NestJS, Next.js, Prisma, and PostgreSQL.

## How to run the project

With Docker installed, open your terminal in the project root and run:

```bash
cp .env.example .env
docker compose up --build
```

The backend will automatically run migrations and populate the database with seed data.

- **Frontend:** <http://localhost:3000>
- **API:** <http://localhost:3001/api>
- **Healthcheck:** <http://localhost:3001/api/health>

---

## Seeding

The database initializes with 2 tenants and 5 contracts. You can use these credentials on the login screen:

| Profile | Email | Password | Tenant |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@alpha.com` | `123456` | Company Alpha |
| **Viewer** | `viewer@alpha.com` | `123456` | Company Alpha |
| **Admin** | `admin@beta.com` | `123456` | Advocacy Beta |

---

## Summary of Technical Decisions

- **Multi-tenancy:** I implemented row-level tenancy—every relevant table includes a `tenantId`. The API validates the tenant via the JWT payload and injects the filter into all Prisma queries, ensuring true tenant isolation.
- **Contracts and Templates:** When creating a contract, fields from the active template are copied as `ContractFieldValue` records, creating an immutable snapshot. Future changes to the template do not affect contracts that have already been generated. - **Change History:** Every creation, field edit, or status change records an entry in `ContractHistory` containing the field, previous value, new value, user, and timestamp.
- **Authentication:** JWT with access token (15 min) and refresh token (7 days). Tokens are stored in `localStorage` on the frontend.
- **Documented Simplifications:** Automatic renewal via refresh token was not implemented on the frontend. Template versioning was also omitted as it was out of scope for the test.

## Tests

```bash
cd backend
npm run test:e2e
```

5 E2E tests covering: onboarding, authentication, the complete contract workflow, and history traceability.

## Useful Scripts

```bash
# Backend
cd backend
npm run test:e2e
npm run build

# Frontend  
cd frontend
npm run build
```
