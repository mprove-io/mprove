# CONTEXT.md

Open Source Business Intelligence with Malloy Semantic Layer.

## Tech Stack

| Layer                                      | Technology                                      |
| ------------------------------------------ | ----------------------------------------------- |
| Package manager                            | pnpm                                            |
| Build orchestration                        | Turborepo                                       |
| Backend framework                          | NestJS                                          |
| Frontend framework                         | Angular 21                                      |
| Database                                   | PostgreSQL + Drizzle ORM                        |
| Database for simple stateless calculations | PostgreSQL                                      |
| Message broker                             | Valkey (Redis) pub/sub                          |
| CLI framework                              | Clipanion                                       |
| Test runner                                | AVA                                             |
| Linter/Formatter                           | Biome (ts/js/css), Prettier (html/scss/json/md) |
| Telemetry                                  | OpenTelemetry                                   |

## Application Services

| App     | Purpose                                     | Framework |
| ------- | ------------------------------------------- | --------- |
| backend | Core API, auth, DB, DWH queries             | NestJS    |
| blockml | Malloy and BlockML (YAML) model compilation | NestJS    |
| disk    | File system & git repo management           | NestJS    |
| front   | Web UI                                      | Angular   |
| mcli    | Command-line interface                      | Clipanion |

## Architecture

Monorepo managed with **Turborepo** and **pnpm**.

Apps communicate:

- frontend to backend - using HTTP API
- mcli to backend - using HTTP API
- backend to blockml - using RPC using Groupmq and Valkey (Redis) pub/sub
- backend to disk - using RPC using Groupmq and Valkey (Redis) pub/sub

## Version Management

All dependency versions are centrally defined in `pnpm-workspace.yaml` catalog.

| Package Type          | Version Syntax | How it works                         |
| --------------------- | -------------- | ------------------------------------ |
| Turbo apps (`apps/*`) | `catalog:`     | pnpm resolves versions automatically |
| Turbo libs (`libs/*`) | explicit       | synced via `pnpm catalog-write`      |
| mcli (bun)            | explicit       | synced via `pnpm catalog-write`      |

Run `pnpm catalog-write` to sync catalog versions to `libs/common`, `libs/node-common`, and `mcli` package.json files.

## Main package.json scripts

| Script     | Command                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| check      | `pnpm typecheck && pnpm lint`                                           |
| typecheck  | `pnpm typecheck:turbo && pnpm typecheck:mcli && pnpm typecheck:scripts` |
| lint       | `pnpm lint:turbo && pnpm lint:mcli && pnpm lint:scripts`                |
| circular   | `pnpm circular:turbo && pnpm circular:mcli && pnpm circular:scripts`    |
| build      | `pnpm build:turbo && pnpm build:mcli`                                   |
| node-serve | `turbo run node-serve`                                                  |
| start      | `turbo run start`                                                       |
| debug      | `turbo run debug`                                                       |
| test       | `turbo run test`                                                        |
| e2e        | `pnpm e2e:turbo && pnpm e2e:mcli`                                       |
| inst       | `pnpm catalog-write && pnpm install && pnpm install:mcli`               |

Scripts follow pattern: `pnpm <task>` runs for all packages, `pnpm <task>:<app>` for specific package.

**Filters:** `backend`, `blockml`, `disk`, `front`, `common`, `node-common`, `mcli`

### ESM Configuration

All apps use native ESM with the following configuration:

**Node.js built-ins:** Use `node:` prefix (e.g., `import { createRequire } from 'node:module'`).

| File            | Key Settings                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| `package.json`  | `"type": "module"`, `imports` field with `#app/*` aliases                    |
| `tsconfig.json` | `"module": "ESNext"`, `"moduleResolution": "Bundler"`, paths with `#` prefix |
| `.swcrc`        | `"target": "es2022"`, `"module": { "type": "nodenext" }`                     |
| `ava.config.js` | Direct TS execution with `@swc-node/register/esm-register`                   |

## Shared Libraries

| Library     | Used By           | Purpose                                    |
| ----------- | ----------------- | ------------------------------------------ |
| common      | All apps          | Shared interfaces, types, enums, constants |
| node-common | Backend apps only | Node.js utilities, telemetry, decorators   |

### libs/common

Shared types, interfaces, enums, and constants used by all apps (frontend and backend).

**Directory Structure:**

```
src/
├── constants/      # Shared constants
├── enums/          # Enumerations
├── functions/      # Pure utility functions
├── interfaces/     # TypeScript interfaces
│   ├── backend/    # Backend-specific interfaces
│   ├── blockml/    # BlockML interfaces
│   ├── disk/       # Disk service interfaces
│   ├── front/      # Frontend interfaces
│   ├── mcli/       # CLI interfaces
│   ├── to/         # Shared request/response types
│   ├── to-backend/ # Frontend→Backend DTOs
│   ├── to-blockml/ # Backend→BlockML DTOs
│   └── to-disk/    # Backend→Disk DTOs
├── models/         # Shared models (ServerError, MyRegex)
└── types/          # TypeScript types
```

**Key Enums:**

- `er.enum.ts` — error codes (`ErEnum`) used across all apps

**Interface Organization:**

- `to-backend/` — request/response interfaces for frontend→backend HTTP calls
- `to-blockml/` — request/response interfaces for backend→blockml RPC
- `to-disk/` — request/response interfaces for backend→disk RPC
- Each subdirectory mirrors the controller structure of its target app

**Patterns:**

- DTOs define both request body and response shape
- Enums are used for type-safe constants across the full stack

### libs/node-common

NodeJS-specific utilities shared across services (backend, blockml, disk) and mcli. Not used by frontend.

**Directory Structure:**

```
src/
├── decorators/     # NestJS method decorators
└── functions/      # Node.js utility functions
```

## Instructions

### Typecheck and lint

Always use top `pnpm check` for typecheck or lint.

### Function and method args

Functions and methods must use a single object argument named `item` with an inline type. Destructure `item` inside the function body.

Example:

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  let { orgId, projectId } = item;
  // ...
}
```

### Object properties

Always use explicit `key: value` syntax in object literals — never use shorthand property names.

```ts
// correct
let payload = { models: models };
doSomething({ sessionId: sessionId });

// wrong
let payload = { models };
doSomething({ sessionId });
```

### No "for (let ... of ..." and "for (let ... in ..."

Use `forEach`, `forEachSeries` for async.

Exception: `for (let i = 0; i < ...; i++)` index loops are allowed.

### No calls in conditions

Do not call functions or methods inside `if` conditions. Extract the result to a variable first.

```ts
// correct
let member = this.membersService.getMember(memberId);
if (!member) {

// wrong
if (!this.membersService.getMember(memberId)) {
```

## External Dependencies

### external/opencode

Source code for the [OpenCode](https://github.com/anomalyco/opencode) dependency used in the project. Kept locally for reference and debugging.

## Commit and PR Guidelines

Do not include AI attribution (e.g., "Generated with Claude Code", "Co-Authored-By: Claude") in commits or pull requests.

## Files Tree

Generated with `./scripts/dev/list-context-files-tree.sh .`

```
_nogit/
.claude/
.devcontainer/
.git/
.github/
.husky/
.pnpm-store/
.turbo/
.vscode/
apps/
external/
libs/
mcli/
mprove_data/
node_modules/
notes/
plans/
scripts/
secrets/
setup-docker/
tmp/
.dockerignore
.DS_Store
.env
.envrc
.gitattributes
.gitignore
.prettierignore
.prettierrc.js
biome.jsonc
CLAUDE.md
CONTEXT.md
docker-compose.yml
LICENSE
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
README.md
tsconfig.base.json
tsconfig.json
turbo.json
```

The "Files Tree" section in each CONTEXT.md must be generated using the `list-context-files-tree.sh` script:

```bash
# Single directory
./scripts/dev/list-context-files-tree.sh <directory>

# Multiple directories (outputs with headers)
./scripts/dev/list-context-files-tree.sh . apps/backend apps/blockml apps/disk apps/front mcli
```

The script ensures consistent ordering: folders first (sorted by `_`, `.`, then alphabetically case-insensitive), then files (same order).

## Subsystem Context

For deeper context on specific subsystems, see:

- [apps/backend/CONTEXT.md](apps/backend/CONTEXT.md)
- [apps/blockml/CONTEXT.md](apps/blockml/CONTEXT.md)
- [apps/disk/CONTEXT.md](apps/disk/CONTEXT.md)
- [apps/front/CONTEXT.md](apps/front/CONTEXT.md)
- [mcli/CONTEXT.md](mcli/CONTEXT.md)

## Maintaining the CONTEXT.md files

This repository uses the [CONTEXT.md convention](https://github.com/the-michael-toy/llm-context-md) for LLM-friendly documentation.

The idea is that for any file of interest, an LLM can walk up the directory tree reading CONTEXT.md files to gather layered context - from specific to general - without loading all context files at once.
