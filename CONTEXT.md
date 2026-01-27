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
| chat    | Session management for Opencode             | NestJS    |
| front   | Web UI                                      | Angular   |
| mcli    | Command-line interface                      | Clipanion |

## Architecture

Monorepo managed with **Turborepo** and **pnpm**.

Apps communicate:

- frontend to backend - using HTTP API
- mcli to backend - using HTTP API
- backend to blockml - using RPC using Groupmq and Valkey (Redis) pub/sub
- backend to disk - using RPC using Groupmq and Valkey (Redis) pub/sub
- backend to chat - using RPC using Groupmq and Valkey (Redis) pub/sub

## Key Files

- `package.json` — scripts for build, serve, test, lint, format
- `turbo.json` — Turborepo workspace configuration
- `tsconfig.base.json` — path aliases
- `docker-compose.yml` — local development stack

## Shared Libraries

| Library     | Used By           | Purpose                                    |
| ----------- | ----------------- | ------------------------------------------ |
| common      | All apps          | Shared interfaces, types, enums, constants |
| node-common | Backend apps only | Node.js utilities, telemetry, decorators   |

### Path Aliases

Configured in root `tsconfig.base.json`:

```
"@mprove/common": ["libs/common/src/index.ts"],
"@mprove/common/*": ["libs/common/src/*"],
"@mprove/node-common": ["libs/node-common/src/index.ts"],
"@mprove/node-common/*": ["libs/node-common/src/*"],
"~backend/*": ["apps/backend/src/*"],
"~blockml/*": ["apps/blockml/src/*"],
"~disk/*": ["apps/disk/src/*"],
"~chat/*": ["apps/chat/src/*"],
"~mcli/*": ["apps/mcli/src/*"],
"~front/*": ["apps/front/src/*"],
"~common/*": ["libs/common/src/*"],
"~node-common/*": ["libs/node-common/src/*"],
```

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
│   ├── chat/       # Chat service interfaces
│   ├── front/      # Frontend interfaces
│   ├── mcli/       # CLI interfaces
│   ├── to/         # Shared request/response types
│   ├── to-backend/ # Frontend→Backend DTOs
│   ├── to-blockml/ # Backend→BlockML DTOs
│   └── to-disk/    # Backend→Disk DTOs
│   └── to-chat/    # Backend→Chat DTOs
├── models/         # Shared models (ServerError, MyRegex)
└── types/          # TypeScript types
```

**Key Enums:**

- `er.enum.ts` — error codes (`ErEnum`) used across all apps

**Interface Organization:**

- `to-backend/` — request/response interfaces for frontend→backend HTTP calls
- `to-blockml/` — request/response interfaces for backend→blockml RPC
- `to-disk/` — request/response interfaces for backend→disk RPC
- `to-chat/` — request/response interfaces for backend→chat RPC
- Each subdirectory mirrors the controller structure of its target app

**Patterns:**

- DTOs define both request body and response shape
- Enums are used for type-safe constants across the full stack

### libs/node-common

NodeJS-specific utilities shared across services (backend, blockml, disk, chat) and mcli. Not used by frontend.

**Directory Structure:**

```
src/
├── decorators/     # NestJS method decorators
└── functions/      # Node.js utility functions
```

## Commit and PR Guidelines

Do not include AI attribution (e.g., "Generated with Claude Code", "Co-Authored-By: Claude") in commits or pull requests.

## Subsystem Context

For deeper context on specific subsystems, see:

- [apps/backend/CONTEXT.md](apps/backend/CONTEXT.md)
- [apps/blockml/CONTEXT.md](apps/blockml/CONTEXT.md)
- [apps/disk/CONTEXT.md](apps/disk/CONTEXT.md)
- [apps/chat/CONTEXT.md](apps/chat/CONTEXT.md)
- [apps/front/CONTEXT.md](apps/front/CONTEXT.md)
- [apps/mcli/CONTEXT.md](apps/mcli/CONTEXT.md)

## Maintaining the CONTEXT Tree

This repository uses the [CONTEXT.md convention](https://github.com/the-michael-toy/llm-context-md) for LLM-friendly documentation.

The idea is that for any file of interest, an LLM can walk up the directory tree reading CONTEXT.md files to gather layered context - from specific to general - without loading all context files at once.
