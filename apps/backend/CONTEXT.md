# apps/backend/CONTEXT.md

Core API server handling authentication, database operations, and data warehouse queries.

## Database

- ORM: Drizzle
- Schema: `src/drizzle/postgres/schema/`
- Migrations: `src/drizzle/postgres/migrations/`
- Entities: avatars, branches, bridges, charts, connections, dashboards, dconfigs, envs, kits, mconfigs, members, models, notes, orgs, projects, queries, reports, structs, users

## Patterns

- Controllers validate DTOs with `class-validator`
- Custom `ServerError` with `ErEnum` error codes for all error responses

## E2E Tests

- Test files: `src/**/*.e2e-spec.ts`
- Run: `pnpm e2e:backend`
- Tests use `prepareTestAndSeed()` to create a fresh NestJS app per test
- Tests must call `await prep.app.close()` to properly close connections
- Services implement `OnModuleDestroy` to close Redis/PostgreSQL connections on shutdown
