# apps/backend/CONTEXT.md

Core API server handling authentication, database operations, and data warehouse queries.

## Files Tree

Generated with `./scripts/dev/list-context-files-tree.sh apps/backend`

```
.turbo/
dist/
node_modules/
src/
.swcrc
ava.config.js
build.mjs
CONTEXT.md
package.json
tsconfig.json
```

## Scripts

| Script      | Command                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| check       | `pnpm typecheck && pnpm lint`                                                                                                                   |
| typecheck   | `tsc --noEmit`                                                                                                                                  |
| lint        | `biome lint src`                                                                                                                                |
| circular    | `madge --circular .`                                                                                                                            |
| build       | `swc src -d dist --source-maps && node build.mjs`                                                                                               |
| node-serve  | `dotenv -e ../../.env -v BACKEND_IS_SCHEDULER=TRUE -- node --enable-source-maps dist/main.js`                                                   |
| start       | `dotenv -e ../../.env -v BACKEND_IS_SCHEDULER=TRUE -- node --import @swc-node/register/esm-register --watch src/main.ts`                        |
| debug       | `dotenv -e ../../.env -v BACKEND_IS_SCHEDULER=TRUE -- node --import @swc-node/register/esm-register --inspect=0.0.0.0:9232 --watch src/main.ts` |
| e2e         | `dotenv -e ../../.env -v IS_TELEMETRY_ENABLED=FALSE -- ava --concurrency=4`                                                                     |
| clean-node  | `rimraf --glob "node_modules/*" "node_modules/.[!.]*"`                                                                                          |
| clean-dist  | `rimraf --glob "dist/*" "dist/.[!.]*"`                                                                                                          |
| clean-turbo | `rimraf --glob ".turbo/*" ".turbo/.[!.]*"`                                                                                                      |

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

## Patterns

- Controllers validate DTOs with `class-validator`
- Custom `ServerError` with `ErEnum` error codes for all error responses

## E2E Tests

- Test files: `src/**/*.e2e-spec.ts`
- Run: `pnpm e2e:backend`
- Tests use `prepareTestAndSeed()` to create a fresh NestJS app per test
- Tests must call `await prep.app.close()` to properly close connections
- Services implement `OnModuleDestroy` to close Redis/PostgreSQL connections on shutdown
