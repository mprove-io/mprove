# apps/backend/CONTEXT.md

Core API server handling authentication, database operations, and data warehouse queries.

## Key Files

- `src/main.ts` — app bootstrap
- `src/app.module.ts` — root NestJS module
- `src/app-controllers.ts` — controller registration
- `src/app-providers.ts` — service/provider registration
- `src/app-filter.ts` — global exception filter
- `src/app-interceptor.ts` — global response interceptor

## Directory Structure

```
src/
├── assets/             # Static config files
├── auth-strategies/    # Passport JWT strategies
├── config/             # App configuration
├── controllers/        # REST API endpoints (grouped by domain)
├── decorators/         # Custom NestJS decorators
├── drizzle/            # Database schema, migrations, utilities
├── functions/          # Standalone helper functions
├── guards/             # Route guards (auth, roles)
├── interfaces/         # TypeScript interfaces
└── services/           # Business logic services
    ├── db/             # Database CRUD services (per entity)
    └── dwh/            # Data warehouse connector services
```

## Controllers (by domain)

avatars, branches, catalogs, charts, check, connections, dashboards, envs, files, folders, mconfigs, members, models, nav, orgs, org-users, projects, queries, reports, repos, special, structs, suggest-fields, telemetry, test-routes, users

## Database

- ORM: Drizzle
- Schema: `src/drizzle/postgres/schema/`
- Migrations: `src/drizzle/postgres/migrations/`
- Entities: avatars, branches, bridges, charts, connections, dashboards, dconfigs, envs, kits, mconfigs, members, models, notes, orgs, projects, queries, reports, structs, users

## Key Services

- `redis.service.ts` — Redis pub/sub RPC to disk/blockml
- `malloy.service.ts` — Malloy query execution
- `store.service.ts` — in-memory state
- `email.service.ts` — email notifications
- `hash.service.ts` — password hashing
- `rpc.service.ts` — RPC message handling

## Patterns

- Controllers validate DTOs with `class-validator`
- Custom `ServerError` with `ErEnum` error codes for all error responses

## E2E Tests

- Test files: `src/**/*.e2e-spec.ts`
- Run: `pnpm e2e:backend`
- Tests use `prepareTestAndSeed()` to create a fresh NestJS app per test
- Tests must call `await prep.app.close()` to properly close connections
- Services implement `OnModuleDestroy` to close Redis/PostgreSQL connections on shutdown
