# Composer Instructions

`AGENTS.md` is generated from the Markdown source files in `.composer/`.Do not
edit `AGENTS.md` directly.

When asked to add or change a rule or section in `AGENTS.md`:

- Edit or create the corresponding Markdown source file in `.composer/`.
- Use `.composer/<section-slug>.md` for a top-level section and
  `.composer/<section-slug>/<rule-slug>.md` for a rule nested under that
  section.
- Every directory inside `.composer/` must have a sibling Markdown file with the
  same name. For example, `.composer/rules/` requires `.composer/rules.md`.
- Source filename stems may contain only lowercase letters (`a-z`), digits
  (`0-9`), and hyphens (`-`).
- Start every source file with an H1 whose slug matches the filename
  case-insensitively. Hyphens in the filename may be replaced with spaces in the
  H1.
- List every Markdown source file exactly once in `.composer/_COMPOSER.md`. The
  manifest order controls output order, and directory depth controls heading
  depth.
- Run `pnpm composer .composer/_COMPOSER.md AGENTS.md` to regenerate
  `AGENTS.md`.

# Mprove

Mprove is Open Source Business Intelligence with Malloy Semantic Layer.

# Tech Stack

| Layer                                      | Technology                                      |
| ------------------------------------------ | ----------------------------------------------- |
| Package manager                            | pnpm                                            |
| Build orchestration                        | Turborepo                                       |
| Backend framework                          | NestJS                                          |
| Frontend framework                         | Angular                                         |
| Database                                   | PostgreSQL + Drizzle ORM                        |
| Database for simple stateless calculations | PostgreSQL                                      |
| Message broker                             | Valkey (Redis) pub/sub                          |
| CLI framework                              | Clipanion                                       |
| Test runner                                | AVA                                             |
| Linter/Formatter                           | Biome (ts/js/css), Prettier (html/scss/json/md) |
| Telemetry                                  | OpenTelemetry                                   |

# Application Services

| App     | Purpose                                     |
| ------- | ------------------------------------------- |
| backend | Core API, auth, DB, DWH queries             |
| blockml | Malloy and BlockML (YAML) model compilation |
| disk    | File system & git repo management           |
| front   | Web UI                                      |
| mcli    | Command-line interface                      |

# Architecture

Apps communicate:

- frontend to backend - HTTP API
- mcli to backend - HTTP API
- backend to blockml - RPC using Groupmq and Valkey (Redis) pub/sub
- backend to disk - RPC using Groupmq and Valkey (Redis) pub/sub

# Dependencies Version Management

All dependency versions are centrally defined in `pnpm-workspace.yaml` catalog.

| Package Type          | Version Syntax | How it works                         |
| --------------------- | -------------- | ------------------------------------ |
| Turbo apps (`apps/*`) | `catalog:`     | pnpm resolves versions automatically |
| Turbo libs (`libs/*`) | explicit       | synced via `pnpm catalog-write`      |
| mcli (bun)            | explicit       | synced via `pnpm catalog-write`      |

Run `pnpm catalog-write` to sync catalog versions to `libs/common`,
`libs/node-common`, and `mcli` package.json files.

# Main package json scripts

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

Scripts follow pattern: `pnpm <task>` runs for all packages, `pnpm <task>:<app>`
for specific package.

**Filters:** `backend`, `blockml`, `disk`, `front`, `common`, `node-common`,
`mcli`

# ESM Configuration

All apps use native ESM with the following configuration:

**Node.js built-ins:** Use `node:` prefix (e.g.,
`import { createRequire } from 'node:module'`).

| File            | Key Settings                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| `package.json`  | `"type": "module"`, `imports` field with `#app/*` aliases                    |
| `tsconfig.json` | `"module": "ESNext"`, `"moduleResolution": "Bundler"`, paths with `#` prefix |
| `.swcrc`        | `"target": "es2022"`, `"module": { "type": "nodenext" }`                     |
| `ava.config.js` | Direct TS execution with `@swc-node/register/esm-register`                   |

# Shared Libraries

| Library     | Used By                             |
| ----------- | ----------------------------------- |
| common      | front, backend, blockml, disk, mcli |
| node-common | backend, blockml, disk, mcli        |

# Blockml

Malloy/BlockML model compilation service. Receives compilation requests from
backend via Valkey (Redis) RPC and returns compiled struct.

## Purpose

Compiles BlockML model definitions (YAML-based) into executable query
structures. The compilation pipeline:

1. Receives file tree from backend
2. Parses Malloy/BlockML model definitions
3. Validates model structure
4. Produces compiled struct

## Communication

- Listens for Valkey (Redis) RPC messages from backend
- Returns compiled structures or compilation errors

# Disk

File system and git repository management service. Manages project file storage
and git operations.

## Purpose

Manages the file system layer for Mprove projects:

- Git repository operations
- File operations within repositories
- Folder management
- Organization/project/git-repo files tree structure
- Seed data initialization

## Communication

- Receives Valkey (Redis) RPC messages from backend
- Operates on local filesystem (`mprove_data/` directory)
- Uses SimpleGit for git operations

# Backend

Core API server handling authentication, database operations, and data warehouse
queries.

## Database

- ORM: Drizzle
- Schema: `src/drizzle/postgres/schema/`
- Migrations: `src/drizzle/postgres/migrations/`

## E2E Tests

- Test files: `src/**/*.e2e-spec.ts`
- Run: `pnpm e2e:backend`
- Tests use `prepareTestAndSeed()` to create a fresh NestJS app per test
- Tests must call `await prep.app.close()` to properly close connections
- Services implement `OnModuleDestroy` to close Redis/PostgreSQL connections on
  shutdown

# Front

Angular web application providing the Mprove user interface.

## Patterns

- Standalone components and NgModules
- Feature modules organized by domain
- HTTP communication with backend via JWT-authenticated calls
- Route guards for auth protection
- Route resolvers for data pre-fetching

# Mcli

Command-line interface for Mprove

## Package Management

mcli uses **bun** as package manager (independent from turbo/pnpm workspace).

## Communication

- Communicates with backend via HTTP API
- Uses same DTOs/interfaces as the frontend

# external

Treat top level "external" directory as a read-only reference. Do not modify it.

## external/byethrow

Source code and documentation for `@praha/byethrow`.

When working with byethrow `Result` APIs, consult:

- English documentation: `external/byethrow/website/docs/en/`
- Implementation: `external/byethrow/packages/byethrow/src/`
- Tests and type tests for exact behavior:
  `external/byethrow/packages/byethrow/src/functions/`

## external/opencode

Source code for the [OpenCode](https://github.com/anomalyco/opencode).

## external/ai

Source code for @ai-sdk

# rules

## Git operations

Do not do git operations like stage / unstage / commit / switch branch / etc...
Use read-only operations if needed (like status, diff, etc)

## Do not run tests unless asked

## Typecheck and lint

Always use top `pnpm check` for typecheck or lint.

## Function and method args

Functions and methods must use a single object argument named `item` with an
inline type. Destructure `item` inside the function body.

Example:

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  let { orgId, projectId } = item;
  // ...
}
```

## Object properties

Always use explicit `key: value` syntax in object literals — never use shorthand
property names.

```ts
// correct
let payload = { models: models };
doSomething({ sessionId: sessionId });

// wrong
let payload = { models };
doSomething({ sessionId });
```

## No "for (let ... of ..." and "for (let ... in ..."

Use `forEach`, `forEachSeries` for async.

Exception: `for (let i = 0; i < ...; i++)` index loops are allowed.

## Type-only imports

Use `import type` (or inline `import { type Foo, ... }`) for any import that is
only used as a TypeScript type — type annotations, generics, `as` casts,
`extends`/`implements`, etc.

```ts
// correct
import type { Request } from 'express';
import {
  type McpToolGetSchemasInput,
  zMcpToolGetSchemasInput
} from '#common/...';

// wrong — runtime ESM error: "does not provide an export named 'McpToolGetSchemasInput'"
import { McpToolGetSchemasInput, zMcpToolGetSchemasInput } from '#common/...';
```

Why: the apps run via `@swc-node/register/esm-register`, which does not elide
value-style imports of names that turn out to be type-only. Native Node ESM
resolution then fails because the source file exports the name only as a `type`.

## Zod optional fields — use `.nullish()`

For optional fields in zod schemas, use `.nullish()` (not `.optional()`).
`.nullish()` accepts both `null` and `undefined`, matching the looseness of
interface definitions and runtime data from upstream systems.

```ts
// correct
status: zFileStatus.nullish(),

// wrong
status: zFileStatus.optional(),
```

## Zod schemas and native types

Define each named Zod schema in a separate file with its corresponding
handwritten TypeScript type.

Export both and verify equivalence with
`assertTypesEqual<Type, z.infer<typeof schema>>`.

Do not define the native type using `z.infer`.

Exception: finite string literal sets may use a single module-local `const`
tuple declared with `as const`, a native type `(typeof tuple)[number]`, and a
schema `z.enum(tuple)`. Preserve the
`assertTypesEqual<Type, z.infer<typeof schema>>` equality assertion.

For every Zod `.extend()`, define the native type using `Extend` from
`#common/types/extend`; do not use TypeScript `extends` or intersection types
for this purpose.

## Explicit variable types

Always declare an explicit type for a variable assigned from a function or
method call. Before returning a value, assign it to an explicitly typed variable
and return that variable. Do not rely on return-type inference at invocation or
return sites.

Exception: `PackerOutput` flows do not require explicit variable or callback
return types. A `retry` callback may directly return `db.drizzle.transaction`,
and its transaction callback may directly return `db.packer.write`, without
intermediate variables.

```ts
await retry(
  async () =>
    await this.db.drizzle.transaction(
      async tx =>
        await this.db.packer.write({
          tx: tx,
          update: { providers: [provider] }
        })
    ),
  getRetryOption(this.cs, this.logger)
);
```

Exception: callbacks passed to collection methods such as `map`, `filter`,
`find`, `findIndex`, `some`, and `sort` may return expressions directly without
an explicit callback return type or an intermediate variable.

Exception: callbacks passed to ts-pattern `with` may return expressions directly
without an explicit callback return type or an intermediate variable.

```ts
let modelIndex: number = provider.models.findIndex(
  item => item.modelId === modelId
);
```

Exception: byethrow `Result` pipelines should preserve their compositional
style.

Within `Result.pipe`:

- Callbacks passed to `Result.map`, `Result.mapError`, `Result.andThen`,
  `Result.andThrough`, `Result.bind`, `Result.inspect`, and
  `Result.inspectError` may return expressions directly without explicit
  callback return types or intermediate variables.
- Variables assigned directly from `Result.pipe` or `Result.unwrap` may rely on
  inferred types when the enclosing function or method has an explicit return
  type.
- Return a `ResultAsync` helper directly instead of wrapping it in redundant
  `async`/`await`.
- Continue using explicit parameter and return types on standalone
  Result-producing functions.

Use the combinator matching the operation:

- `map` transforms a successful value without introducing an anticipated error.
- `mapError` transforms an anticipated error.
- `andThen` replaces the successful value with another Result-producing
  computation.
- `andThrough` runs a validation or side effect and preserves the successful
  value.
- `bind` retains a successful computation under a semantic property name when
  later steps need it. Do not bind `void` results or final projections.

Use `Result` failures for anticipated domain errors. Unexpected infrastructure
errors may throw unless they are intentionally converted using `Result.try` or
`Result.fn`.

For local object projections, prefer a named handwritten type over `Pick`. Use
explicit mapping when the runtime object must contain only the projected fields.

```ts
// correct
type ResponseModelPart = {
  modelId: string;
  name: string;
};

let responseModelParts: ResponseModelPart[] = models.map(model => ({
  modelId: model.modelId,
  name: model.name
}));

// wrong
type ResponseModelPart = Pick<LlmModel, 'modelId' | 'name'>;
```

```ts
// correct
let modelParts: LlmModelPart[] = await this.llmModelService.getModelParts({
  providerType: providerType
});

let devModels: DevModel[] = models.map(model => toDevModel(model));

return devModels;

// wrong
let modelParts = await this.llmModelService.getModelParts({
  providerType: providerType
});

return models.map(model => toDevModel(model));
```

## Empty lines between statements

Add an empty line between code statements. Do not add empty lines within a
single multiline statement.

Exception: in callbacks passed to byethrow `Result` combinators, an empty line
before `return` may be omitted when the callback body contains exactly one
preceding statement.

```ts
Result.andThrough(async item => {
  await ensureDir(item.orgDir);
  return Result.succeed();
});
```

```ts
// correct
let modelParts: LlmModelPart[] = await this.llmModelService.getModelParts({
  providerType: providerType
});

let devModels: DevModel[] = models.map(model => toDevModel(model));

return devModels;

// wrong
let modelParts: LlmModelPart[] = await this.llmModelService.getModelParts({
  providerType: providerType
});
let devModels: DevModel[] = models.map(model => toDevModel(model));
return devModels;
```

## Optional TypeScript properties

Do not explicitly add `| null` or `| undefined` to TypeScript types.

- For optional properties and arguments, use `name?: string`.
- For variables that may be absent, restructure initialization instead of
  declaring an explicit `| null` or `| undefined` union.
- Corresponding Zod schemas should still use `.nullish()` when runtime input may
  contain `null` or `undefined`.

```ts
// correct
apiKey?: string;
let availableModelIds = condition ? new Set<string>() : undefined;

// wrong
apiKey?: string | null;
let availableModelIds: Set<string> | undefined;
```

## Discriminator property should be first

In every member of a discriminated union, declare the discriminator property
first. In corresponding object literals, also place the discriminator property
first.

## No calls in conditions

Do not call functions or methods inside `if` conditions. Extract the result to a
variable first.

These existing functions can be called in conditions:

- isDefined
- isDefinedAndNotEmpty
- isUndefiend
- isUndefinedOrEmpty

```ts
// correct
let member = this.membersService.getMember(memberId);
if (!member) {

// wrong
if (!this.membersService.getMember(memberId)) {
```

# byethrow rules

## one function per file

## no nested pipes in a single function

## pipe should start with result succeed
