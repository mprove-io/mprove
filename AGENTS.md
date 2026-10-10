# Composer Instructions

`AGENTS.md` is generated from the Markdown source files in `.composer/content/`.
Do not edit `AGENTS.md` directly.

When asked to add or change a rule or section in `AGENTS.md`:

- Edit or create the corresponding Markdown source file in `.composer/content/`.
- Use `.composer/content/<section-slug>.md` for a top-level section and
  `.composer/content/<section-slug>/<rule-slug>.md` for a rule nested under that
  section.
- Every directory inside `.composer/content/` must have a sibling Markdown file
  with the same name. For example, `.composer/content/rules/` requires
  `.composer/content/rules.md`.
- Source filename stems may contain only lowercase letters (`a-z`), digits
  (`0-9`), and hyphens (`-`).
- Start every source file with an H1 whose slug matches the filename
  case-insensitively. Hyphens in the filename may be replaced with spaces in the
  H1.
- Every directory inside `.composer/content/` must contain at least one file or
  subdirectory; Composer rejects empty directories.
- List every Markdown source file exactly once in `.composer/COMPOSER.md` as a
  Markdown list with one path per list item. The manifest order controls output
  order, and directory depth controls heading depth.
- Run `pnpm composer .composer/COMPOSER.md .composer/content AGENTS.md` to
  regenerate `AGENTS.md`.

# Mprove

Mprove is Open Source Business Intelligence with Malloy Semantic Layer.

# Architecture

Parts:

| App     | Purpose                                     |
| ------- | ------------------------------------------- |
| backend | Core API, auth, DB, DWH queries             |
| blockml | Malloy and BlockML (YAML) model compilation |
| disk    | File system & git repo management           |
| front   | Web UI                                      |
| mcli    | Command-line interface                      |

Communication:

- frontend to backend - HTTP API
- mcli to backend - HTTP API
- backend to blockml - RPC using Groupmq and Valkey (Redis) pub/sub
- backend to disk - RPC using Groupmq and Valkey (Redis) pub/sub

## Blockml

Malloy/BlockML model compilation service. Receives compilation requests from
backend via Valkey (Redis) RPC and returns compiled struct.

### Purpose

Compiles BlockML model definitions (YAML-based) into executable query
structures. The compilation pipeline:

1. Receives file tree from backend
2. Parses Malloy/BlockML model definitions
3. Validates model structure
4. Produces compiled struct

### Communication

- Listens for Valkey (Redis) RPC messages from backend
- Returns compiled structures or compilation errors

## Disk

File system and git repository management service. Manages project file storage
and git operations.

### Purpose

Manages the file system layer for Mprove projects:

- Git repository operations
- File operations within repositories
- Folder management
- Organization/project/git-repo files tree structure
- Seed data initialization

### Communication

- Receives Valkey (Redis) RPC messages from backend
- Operates on local filesystem (`mprove_data/` directory)
- Uses SimpleGit for git operations

## Backend

Core API server handling authentication, database operations, and data warehouse
queries.

### Database

- ORM: Drizzle
- Schema: `src/drizzle/postgres/schema/`
- Migrations: `src/drizzle/postgres/migrations/`

### E2E Tests

- Test files: `src/**/*.e2e-spec.ts`
- Run: `pnpm e2e:backend`
- Tests use `prepareTestAndSeed()` to create a fresh NestJS app per test
- Tests must call `await prep.app.close()` to properly close connections
- Services implement `OnModuleDestroy` to close Redis/PostgreSQL connections on
  shutdown

## Front

Angular web application providing the Mprove user interface.

### Patterns

- Standalone components and NgModules
- Feature modules organized by domain
- HTTP communication with backend via JWT-authenticated calls
- Route guards for auth protection
- Route resolvers for data pre-fetching

## Mcli

Command-line interface for Mprove

### Package Management

mcli uses **bun** as package manager (independent from turbo/pnpm workspace).

### Communication

- Communicates with backend via HTTP API
- Uses same DTOs/interfaces as the frontend

## Shared Libraries

| Library     | Used By                             |
| ----------- | ----------------------------------- |
| common      | front, backend, blockml, disk, mcli |
| node-common | backend, blockml, disk, mcli        |

# Info

## Tech Stack

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

## Dependencies Version Management

All dependency versions are centrally defined in `pnpm-workspace.yaml` catalog.

| Package Type          | Version Syntax | How it works                         |
| --------------------- | -------------- | ------------------------------------ |
| Turbo apps (`apps/*`) | `catalog:`     | pnpm resolves versions automatically |
| Turbo libs (`libs/*`) | explicit       | synced via `pnpm catalog-write`      |
| mcli (bun)            | explicit       | synced via `pnpm catalog-write`      |

Run `pnpm catalog-write` to sync catalog versions to `libs/common`,
`libs/node-common`, and `mcli` package.json files.

## Main package json scripts

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

## ESM Configuration

All apps use native ESM with the following configuration:

**Node.js built-ins:** Use `node:` prefix (e.g.,
`import { createRequire } from 'node:module'`).

| File            | Key Settings                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| `package.json`  | `"type": "module"`, `imports` field with `#app/*` aliases                    |
| `tsconfig.json` | `"module": "ESNext"`, `"moduleResolution": "Bundler"`, paths with `#` prefix |
| `.swcrc`        | `"target": "es2022"`, `"module": { "type": "nodenext" }`                     |
| `ava.config.js` | Direct TS execution with `@swc-node/register/esm-register`                   |

## External

Treat top level "external" directory as a read-only reference. Do not modify it.

### external/byethrow

Source code and documentation for `@praha/byethrow`.

When working with byethrow `Result` APIs, consult:

- English documentation: `external/byethrow/website/docs/en/`
- Implementation: `external/byethrow/packages/byethrow/src/`
- Tests and type tests for exact behavior:
  `external/byethrow/packages/byethrow/src/functions/`

### external/opencode

Source code for the [OpenCode](https://github.com/anomalyco/opencode).

### external/ai

Source code for @ai-sdk

# Rules

## DRY

Keep project instructions and rules DRY (Don't Repeat Yourself). Define each
requirement in one authoritative section. Refer to that section when another
rule depends on it instead of repeating its instructions.

When adding or changing a rule, check related sections for overlap. Consolidate
duplicate requirements and keep exceptions with the rule they qualify. Examples
may illustrate another rule without restating its requirements.

## Git operations

Do not do git operations like stage / unstage / commit / switch branch / etc...
Use read-only operations if needed (like status, diff, etc)

## Do not run tests unless asked

## Do not write tests unless asked

## Typecheck and lint

Always use top `pnpm check` for typecheck or lint.

## One function per file

Each non-test file may define at most one standalone named function
implementation.

This rule applies to function declarations and function-valued variables at
module scope. It does not apply to callbacks, class or object methods,
constructors, getters, or setters.

Types, schemas, constants, and other non-function declarations may coexist with
the function in the same file.

## Function and method args

Named functions and methods must use a single object argument named `item` with
an inline type. This rule does not apply to callbacks.

Example:

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  // ...
}
```

## Item destructuring

Destructure `item` inside a named function or method when individual properties
are needed outside a `Result.pipe` pipeline.

Only top-level controller and MCP-tool handlers may forward a complete input
directly or spread it before adding trusted context. Avoid destructuring solely
for forwarding there. Elsewhere, explicitly map arguments. Keep explicit mapping
for subsets, renamed fields, or transformations.

Result pipelines follow "Pipe state" and "Pipe step callbacks" instead.

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  let { orgId, projectId } = item;
  // ...
}

return this.connectionSampleService.getConnectionSampleResult({
  ...body.input,
  userId: user.userId
});
```

## Recursive function names

Functions that call themselves recursively must have the `Recursive` suffix in
their name.

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

Use `forEach` for synchronous iteration.

Use `forEachSeries` when an asynchronous callback must be awaited sequentially.

Exception: `for (let i = 0; i < ...; i++)` index loops are allowed.

## Type-only imports

Use `import type` (or inline `import { type Foo, ... }`) for any import that is
only used as a TypeScript type — type annotations, generics, `as` casts,
`extends`/`implements`, etc.

Do not use inline `import('module').Type` type queries. Import the type at the
module level. When the module also has a value import, combine them in one
declaration.

```ts
// correct
import type { Request } from 'express';
import {
  type McpToolGetSchemasInput,
  zMcpToolGetSchemasInput
} from '#common/...';
import fse, { type Stats } from 'fs-extra';

let stat: Stats = await fse.lstat(filePath);

// wrong — runtime ESM error: "does not provide an export named 'McpToolGetSchemasInput'"
import { McpToolGetSchemasInput, zMcpToolGetSchemasInput } from '#common/...';

// wrong — use a module-level type import
let stat: import('fs-extra').Stats;
```

Why: the apps run via `@swc-node/register/esm-register`, which does not elide
value-style imports of names that turn out to be type-only. Native Node ESM
resolution then fails because the source file exports the name only as a `type`.

## Domain literals

Keep domain string literals type checked using the rules below.

### Canonical values

Define each finite domain union from one canonical `as const` tuple. Reuse it
for the type, schema when needed, and complete value lists. Export it when
callers need the values; do not duplicate the complete set.

Use `as const` only for canonical tuples or when downstream types require exact
literals. For the latter, use `as const satisfies` with an existing contract.
`as const` alone does not validate domain membership.

```ts
export const taskStatusValues = ['queued', 'running', 'done'] as const;

export type TaskStatus = (typeof taskStatusValues)[number];
```

### Named declarations

Use explicit domain types for named variables, objects, parameters, and return
types. Literal-array collections follow the "Collections" rule instead.

Do not widen domain types to `string`. Import types with `import type`; do not
use `as` assertions to bypass checking.

```ts
let status: TaskStatus = 'queued';
```

### Inline checks

Use `satisfies` for inline expressions without a domain-checked context. Prefer
checking the whole object or collection against an existing contract; otherwise
check individual domain literals.

```ts
JSON.stringify({
  status: 'queued' satisfies TaskStatus
});
```

### Typed contexts

Do not add `satisfies` where the context already checks domain membership.
Drizzle's `eq` and `inArray` check values against a column's
`$type<DomainType>()`.

Prefer typing the underlying column or contract when it represents a domain.
Keep explicit checks where the context is `string`, `any`, or otherwise
unchecked.

```ts
// tasksTable.status has .$type<TaskStatus>().
inArray(tasksTable.status, ['queued', 'running']);
```

### Angular template contexts

With `strictTemplates` enabled, keep domain literals inline in equality and
inequality comparisons when Angular checks them against a finite domain union.
Do not introduce component properties solely for already-checked comparisons.

```html
<!-- chartType is ChartType, so Angular checks the literal. -->
<div *ngIf="chartType === 'table'"></div>
```

For comparisons against `any`, broad `string`, or otherwise unchecked values,
prefer typing the underlying form control or template context with its domain
type. If that is not practical, expose a `readonly` component property with an
explicit domain type and use it in the template.

Do not assume a template value is typed merely because its source collection is
typed. Third-party `let-item` contexts and plain `ng-template` contexts may
expose `any` even with `strictTemplates` enabled.

This comparison rule does not apply to all template expressions. Legacy
`*ngSwitchCase` does not check membership against the switch expression's
domain, and concatenation does not check domain tokens. Use explicitly
domain-typed component properties for those unchecked literals. Template
collections follow the separate "Angular collections" rule; checking a
membership argument does not validate every literal in an inline array against
the domain.

### Interpolation

Interpolate domain literals using `satisfies` with their existing union type; do
not embed domain tokens as unchecked plain text. Ordinary prose and
already-typed expressions need no checks.

```ts
let message: string = `Task status must be "${'queued' satisfies TaskStatus}"`;
```

### Collections

Separate collections must serve a distinct purpose: a subset, display order, or
UI metadata. Complete value lists must reuse the canonical tuple.

Keep one-off collections inline; use whole-array `satisfies DomainType[]` unless
the context already checks membership. Do not extract a collection solely for
type checking. Keep collections named when reused or required by templates.

Use `satisfies DomainType[]` for named literal arrays to preserve inferred
subset types. Use explicit domain-array types for collections initialized from
other values, or when needed for `includes` or Angular template membership
checks. Do not widen to `string[]` or use a cast.

```ts
export const activeTaskStatuses = ['queued', 'running'] satisfies TaskStatus[];
```

### Angular collections

For template collections used with `indexOf` or `includes`, use an explicit
domain-array annotation and call the method directly in the template.

Do not add a helper or component method solely to work around a narrowed
collection's membership argument type.

```ts
readonly activeTaskStatuses: TaskStatus[] = ['queued', 'running'];
```

## Zod optional fields — use `.nullish()`

For optional fields in zod schemas, use `.nullish()` (not `.optional()`).
`.nullish()` accepts both `null` and `undefined`, matching the looseness of
interface definitions and runtime data from upstream systems.

Exception: files whose names match `*-config.ts` may use `.optional()`.

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

This requirement is one-way: a native TypeScript type does not automatically
require a Zod schema. Add a schema when needed for runtime validation or
contract composition, not merely because a native type exists.

Do not define the native type using `z.infer`.

Example in `member.ts` (imports omitted):

```ts
export type Member = {
  id: string;
  nickname?: string;
};

export const zMember = z.object({
  id: z.string(),
  nickname: z.string().nullish()
});

assertTypesEqual<Member, z.infer<typeof zMember>>({
  value: true
});
```

Exception: finite domain string unions follow "Canonical values" under "Domain
literals". Use their canonical `as const` tuple, a native type
`(typeof tuple)[number]`, and a schema `z.enum(tuple)`. Preserve the
`assertTypesEqual<Type, z.infer<typeof schema>>` equality assertion.

For every Zod `.extend()`, define the native type using `Extend` from
`#common/types/extend`; do not use TypeScript `extends` or intersection types
for this purpose.

Example in a separate `member-with-label.ts`, using imported `Member`,
`zMember`, and `Extend` (imports omitted):

```ts
export type MemberWithLabel = Extend<Member, { label: string }>;

export const zMemberWithLabel = zMember.extend({
  label: z.string()
});

assertTypesEqual<MemberWithLabel, z.infer<typeof zMemberWithLabel>>({
  value: true
});
```

## Explicit variable types

Always declare an explicit type for a variable assigned from a function or
method call. Before returning a value, assign it to an explicitly typed variable
and return that variable. Do not rely on return-type inference at invocation or
return sites.

Exception: Byethrow Result flows follow the exceptions under "Result type
inference".

Exception: when a function, method, or callback with an explicit return type
returns a promise chain, its `.then(...)` callbacks may return expressions
directly without intermediate variables or their own return annotations. The
outer return contract checks the returned promise's value type. This applies to
expression-bodied callbacks and direct returns from block-bodied callbacks,
including chains returning `Result.ResultAsync<Success, Error>`.

```ts
async function loadMemberName(item: { memberId: string }): Promise<string> {
  let { memberId } = item;

  return loadMember({ memberId: memberId }).then(member => member.name);
}
```

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

## Async promise chains

Use `async` for promise-chain functions or methods where TypeScript offers "This
may be converted to an async function" (`ts(80006)`), even when their bodies
contain no `await`. Keep the explicit outer return type.

Keep `.then(...)` when it expresses lookup/conversion clearly; do not rewrite it
to `await` solely to satisfy that suggestion.

Block-bodied arrow functions (`=> { ... }`) with an explicit
`Result.ResultAsync<Success, Error>` return type must be declared `async`, even
when their bodies contain no `await`. Expression-bodied arrow functions
(`=> expression`) are exempt from this requirement.

Otherwise, do not add `async` to callbacks solely because they return a promise
when no `ts(80006)` suggestion applies. Expression-bodied Result combinator
callbacks may directly return a promise chain with an explicit
`Result.ResultAsync<Success, Error>` return type and no `async`. Use `async`
when the callback needs `await`; keep synchronous `.then(...)` conversion
callbacks non-async.

When a Result callback must return a promise but has a synchronous fallback
branch, make the enclosing callback `async` and return `Result.succeed(...)`
directly from that branch instead of `Promise.resolve(Result.succeed(...))`.
Retain its explicit `Result.ResultAsync<Success, Error>` return type and keep
query `.then(...)` conversion chains intact.

Keeping `async` on functions and methods also preserves conversion of
synchronous exceptions in the outer body to promise rejections. Direct returns
from `.then(...)` follow the promise-chain exception under "Explicit variable
types".

## Fire and forget promises

When deliberately starting asynchronous work without waiting for it, prefix the
promise-producing expression with `void` at the call site. Apply this inside
callbacks too, including timer callbacks and Result pipeline steps.

When subsequent work depends on completion, await or return the promise instead.
Do not add `void` merely to silence an accidentally unawaited operation.

`void` documents intentional promise disposal; it does not handle rejection.
Preserve existing background rejection handling and the behavior-preservation
requirements under "Pipe step granularity" when clarifying existing calls.

```ts
Result.andThrough(v => {
  void this.finishRefreshCachedColumn({ projectId: v.projectId });
  return Result.succeed();
});
```

## Entity and Tab variable names

For database entities and their converted Tab values:

- End a single entity's variable name with `Ent` (for example, `projectEnt`).
- End an entity collection's variable name with `Ents` (for example,
  `projectEnts`).
- Reserve the corresponding unsuffixed domain names for Tab values: `project`
  for `ProjectTab`, `projects` for `ProjectTab[]`. Do not add a `Tab` or `Tabs`
  suffix to these variable names.
- Apply the same distinction to collection callback parameters, function
  argument properties, and Result pipeline keys carrying entity or Tab values.
- Preserve descriptive prefixes: `connectionsWithFallbackEnts` contains
  entities, while `connectionsWithFallback` contains Tabs. API/base projections
  use explicit prefixes such as `apiProject` and `baseProject` to distinguish
  them from Tabs.

```ts
let projectEnt: ProjectEnt;

let project: ProjectTab;

let projectEnts: ProjectEnt[];

let projects: ProjectTab[];
```

## Local object projections

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

## Empty lines between statements

Add an empty line between code statements. Do not add empty lines within a
single multiline statement.

Exception: in callbacks passed to byethrow `Result` combinators, an empty line
before `return` may be omitted when the callback body contains exactly one
preceding statement.

```ts
Result.andThrough(async v => {
  await ensureDir(v.orgDir);
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

```ts
// correct
apiKey?: string;

// wrong
apiKey?: string | null;
```

## Discriminator property should be first

In every member of a discriminated union, declare the discriminator property
first. In corresponding object literals, also place the discriminator property
first.

## Condition expressions

Use the rules below for conditions. Collection membership follows the separate
"Membership checks" rule.

### Boolean conditions

Inline a boolean expression or boolean-returning call when a variable would only
store it for one condition. Exception: name membership booleans in compound
conditions as specified by "Membership checks".

Start boolean variable names with `is`: use `isOutputInParent`, not
`outputIsInParent`.

```ts
if (isDefined(member) && sourcePath !== outputPath) {
  // Process the member.
}
```

### Negated comparisons

When negating a single comparison, use the inverse comparison operator rather
than wrapping the comparison in `!`. Prefer `!==` over `!(... === ...)`, `===`
over `!(... !== ...)`, and inverse relational operators where equivalent.

This rule does not require rewriting negated compound conditions or
boolean-returning calls. Collection membership follows "Membership checks".

```ts
// correct
if (parameter !== ('columns' satisfies FileParameter)) {
  // Handle other parameters.
}

// wrong
if (!(parameter === ('columns' satisfies FileParameter))) {
  // Handle other parameters.
}
```

### Undefined checks

Use `isUndefined(value)`, not `!isDefined(value)`, when checking for an
undefined value.

```ts
if (isUndefined(member)) {
  // Handle the missing member.
}
```

### Non boolean results

Assign a non-boolean function or method result to an explicitly typed variable
before evaluating it in a condition.

Exception: compare membership indices directly as specified by "Membership
checks"; do not store an index solely to test presence or absence.

```ts
let member: Member = members.get(memberId);

if (isUndefined(member)) {
  // Handle the missing member.
}
```

## Membership checks

For value-based presence checks, use `.includes(value)` instead of
`.indexOf(value) > -1`.

For value-based absence checks, use `.indexOf(value) < 0` rather than negating
`.includes(value)`.

Use value-based checks when the argument type is accepted; for broader inputs or
property comparisons, use callback-based checks.

For callback-based presence checks, use `.some(callback)` instead of
`.findIndex(callback) > -1`.

For callback-based absence checks, use `.findIndex(callback) < 0` rather than
negating `.some(callback)`.

Compare membership indices directly with `0` or `-1`. Keep a named index only
when the index itself is needed, such as for array access, insertion, or
ordering.

In compound conditions, name the membership boolean with a descriptive `is...`
variable, even if used only once. Store the boolean, not a separate numeric
index.

```ts
let isActiveTask = (['queued', 'running'] satisfies TaskStatus[]).some(
  status => status === task.status
);

if (task.canRun && isActiveTask) {
  // Handle active tasks.
}

if (tasks.findIndex(task => task.id === taskId) < 0) {
  // Handle the missing task.
}

if (taskIds.includes(taskId)) {
  // Handle the existing task.
}

if (taskIds.indexOf(taskId) < 0) {
  // Handle the missing task.
}
```

## Function folders call tree

- A caller is a non-test file that directly imports and uses a standalone named
  project-local function. The imported function is the callee. Count each caller
  once per callee.
- Treat the specified standalone named project-local function as the root.
- For each function in the tree, inspect the callees imported by its file and
  used by the function.
- When a callee has one caller, move it to `<function-name>/<function-name>.ts`
  under the current function's directory and apply these rules to it
  recursively.
- When a callee has multiple callers, keep it in an appropriate shared
  `functions/` location in the app, `node-common`, or `common`. Callers must
  import it directly from its implementation path.
- Move tests with their function and remove directories left empty by a move.
- If a type is used only by a caller and its callee, define it in the callee's
  file.
- Prefer flat pipes. Before adding another directory level, check whether the
  operation can be another step in the existing linear pipeline.

## Maintain function folder call trees

When a function is already organized according to the "Function folders call
tree" rule, reapply that rule whenever changing the root function or any
function in its tree. Do not apply it to a function that is not already part of
an established function folder call tree unless the user explicitly asks.

## Byethrow

### No nested pipes in a single function

### Result type inference

Byethrow `Result` pipelines are exempt from the general explicit variable type
rule in these cases:

- Callbacks passed to Result combinators may return expressions directly without
  intermediate variables.
- Variables assigned directly from `Result.pipe` or `Result.unwrap` may rely on
  inferred types when the enclosing function or method has an explicit return
  type.
- Return `Result.succeed` and `Result.fail` directly without intermediate
  variables.
- Return a `ResultAsync` helper directly without redundant `await`; promise
  chains follow "Async promise chains".

Standalone Result-producing functions must retain explicit return types.

### Result callback return types

Callbacks passed to `Result.bind` and `Result.andThen` must declare an explicit
`Result.Result<Success, Error>` or `Result.ResultAsync<Success, Error>` return
type, matching whether the callback returns a synchronous Result or a promise.

Use named handwritten types for object-shaped callback success values, including
array elements, rather than inline object types. Keep local types in the same
file unless shared. Function parameter types still follow "Function and method
args".

```ts
Result.bind(
  'manifest',
  (v): Result.Result<Manifest, ComposerError> =>
    loadManifest({
      manifestPath: v.manifestPath
    })
);
```

```ts
Result.andThen(
  (v): Result.Result<Something, DoSomethingError> => doSomething(v)
);
```

Callbacks passed to `Result.map` must declare an explicit success-value return
type.

Exception: synchronous in-place mutation callbacks described in "Byethrow
function selection" may infer their return type. Do not introduce a state type
solely to annotate them.

```ts
Result.map(v => {
  v.role.gvs.push({ givenId: v.givenId, values: v.values });
  return v;
});
```

Keep a one-off final projection inline in the `Result.map` callback. Do not
extract it into a named function used only by that final projection.

When the callback only constructs the output object, return the object directly
with an expression body. Do not introduce a redundant typed `payload` variable
followed by `return payload`. Intermediate operations follow "Pipe step
granularity".

```ts
Result.map(
  (v): SomeType => ({
    modelId: v.modelId,
    name: v.name
  })
);
```

Callbacks passed to `Result.andThrough` do not require an explicit return type.

### Combine lookup and conversion

When a database entity or entity collection is used only for conversion to a Tab
value, combine lookup and conversion in one Result binding. Keep the entity
local to the callback rather than adding an entity binding followed immediately
by a Tab binding.

Use the query promise's `.then(...)` for conversion, following "Result callback
return types" and the promise-chain exception under "Explicit variable types".
The outer callback follows "Async promise chains".

```ts
Result.bind(
  'avatar',
  (v): Result.ResultAsync<AvatarTab, AvatarEntToTabResultError> =>
    this.db.drizzle.query.avatarsTable
      .findFirst({
        where: eq(avatarsTable.userId, v.avatarUserId)
      })
      .then((avatarEnt: AvatarEnt) =>
        isUndefined(avatarEnt)
          ? Result.succeed(undefined)
          : this.tabService.avatarEntToTabResult({ avatarEnt: avatarEnt })
      )
);
```

For collections, return `Result.sequence` with the conversion callback from
`.then(...)`, preserving first-failure processing order.

Keep missing-entity guards at the caller and preserve existing missing-value
behavior. Keep steps separate when entities are needed elsewhere in the
pipeline, including authorization, existence checks, or mutations. When
combining steps, follow the preservation requirements in "Pipe step
granularity".

### Inline guarded Result callbacks

Use an expression-bodied conditional for Result combinator and
promise-conversion callbacks that only select between a fallback Result and one
operation, including simple success/failure checks.

For guarded existence queries, return
`.then(ent => Result.succeed(isDefined(ent)))` instead of awaiting a temporary
entity. Tab conversion follows "Combine lookup and conversion".

Keep block bodies for multi-statement orchestration; do not restructure it
solely to inline a callback.

Async handling, guard ownership, and behavior preservation follow "Async promise
chains", "Guard optional operations at caller", and "Pipe step granularity".

### Function error types

For every Result-producing function with anticipated errors, define a named
`<FunctionName>Error` type in `types/function-errors/<function-name>-error.ts`.

The function error type must union errors created directly by the function with
the function error types of directly called lower-level functions. Import
lower-level function error types instead of repeating their leaf error members.

Define single-member and pass-through aliases as function error types too, so
every fallible function has its own error contract.

### Byethrow function selection

Use the Byethrow function matching the operation.

#### Creating results

- `succeed` creates a successful result.
- `fail` creates a failed result.
- `do` creates `succeed({})` as a neutral object-building pipeline state.
- `try` immediately executes a possibly throwing function and converts the
  outcome to a result.
- `fn` wraps a possibly throwing function and returns a reusable
  Result-producing function.

#### Composing and transforming

- `pipe` applies functions from left to right.
- `map` transforms or mutates pipeline data without introducing an anticipated
  error. For an in-place mutation, return the same state object with `return v`
  to preserve references.
- `mapError` transforms a failure value.
- `andThen` replaces a success with another Result-producing computation.
- `andThrough` runs a validation or operational side effect, such as
  persistence, notification, or a background-work launch, and preserves the
  original success. Return the operation's Result or ResultAsync so its
  anticipated failure stops the pipeline. Background launches follow "Fire and
  forget promises" and immediately return `Result.succeed()`, confirming launch
  rather than completion.
- `bind` adds a Result-producing computation's success under a named property.
  Do not bind `void` results or final projections.
- `orElse` replaces a failure with another Result-producing computation.
- `orThrough` runs a Result-producing operation on a failure and preserves the
  original failure when that operation succeeds.
- `inspect` is reserved for observation, such as debug logging and diagnostics,
  without mutating pipeline data.
- `inspectError` runs an infallible side effect on a failure without changing
  the result.

Both `inspect` and `andThrough` wait for promises returned by their callbacks,
but only `andThrough` propagates a returned Result failure. Do not discard a
fallible Result inside either callback. Callback annotations follow "Result
callback return types".

#### Combining and validating

- `sequence` combines results, stopping at the first failure.
- `collect` combines results, processing all inputs and collecting every
  failure.
- `parse` validates a value with a synchronous Standard Schema and returns
  validation issues as a failure.

#### Checking and asserting

- `isResult` checks whether an unknown value has a Result shape.
- `isSuccess` narrows a result to a success.
- `isFailure` narrows a result to a failure.
- `assertSuccess` asserts that a result with error type `never` is successful.
- `assertFailure` asserts that a result with success type `never` is failed.

#### Extracting values

- `unwrap` extracts the success value, using a default or throwing the failure.
- `unwrapError` extracts the failure value, using a default or throwing the
  success value.

### Combinator application

Pass Result combinators as steps to `Result.pipe`. Do not directly invoke the
curried function returned by a combinator, such as
`Result.map(callback)(result)`. If using `Result.pipe` would create a nested
pipe in the same function, extract the operation into a standalone function in
its own file.

### Sequence Result collections

Use `Result.sequence` when applying a Result-producing operation to every item
in a collection and processing should stop at the first failure. Do not manually
accumulate the collection result by repeatedly applying a curried combinator.

### Error policy

Use `Result` failures for anticipated domain errors. Unexpected infrastructure
errors may throw unless they are intentionally converted using `Result.try` or
`Result.fn`.

### Pipe state

**Initialization**

Start every `Result.pipe` with `Result.succeed`.

When `item` has an inline object type declared in the function or method
parameter list, use `Result.succeed(item)` when no additional or derived values
are needed. When adding additional or derived values, spreading `item` into an
explicit object is allowed.

When the input structure comes from another file, explicitly list each input
property carried into the pipeline using `key: value` syntax. Do not pass or
spread the input object directly.

Exception: an input whose type is a union of object variants may be carried
intact under a named pipeline-state property, even when its type comes from
another file. Use this to preserve variant relationships and property presence
without rebuilding each variant. Do not spread or flatten the union into state.

```ts
Result.succeed({
  input: body.input,
  userId: user.userId
});
```

```ts
export function buildSpace(item: {
  spaces: FileSpace[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FilePartSpace[], never> {
  return Result.pipe(
    Result.succeed(item)
    // Steps access operation data through v.
  );
}
```

```ts
// Inline parameter type, with derived data:
Result.succeed({
  ...item,
  repoDir: `${item.projectDir}/${item.repoId}`
});

// Imported input type:
return Result.pipe(
  Result.succeed({
    orgId: item.orgId,
    projectId: item.projectId
  }),
  Result.andThen(
    (v): Result.Result<Something, DoSomethingError> => doSomething(v)
  )
);
```

**Step access**

After the initial `Result.succeed`, access operation inputs and accumulated
pipeline data only through `v`. Do not reference `item`, `body.input`, other
arguments, destructured argument properties, or local variables declared before
`Result.pipe`. Carry all required operation data through the pipeline state.

In NestJS controller and service methods, access injected dependencies and
instance methods directly through `this`, including inside nested callbacks
within a step. Do not copy dependencies or the class instance into pipeline
state or local aliases.

Controller DTO example:

```ts
return Result.pipe(
  Result.succeed({
    projectId: body.input.projectId,
    userId: user.userId
  }),
  Result.andThen(
    (v): Result.Result<Something, DoSomethingError> =>
      this.someService.doSomething({
        projectId: v.projectId,
        userId: v.userId
      })
  )
);
```

### Pipe step granularity

Prefer flat pipelines with named steps for distinct intermediate operations
rather than putting several prerequisite queries or transformations in one
callback.

- Separate prerequisite lookups and derived query inputs, such as ID arrays,
  when doing so leaves each query binding focused on one operation.
- Bind intermediate filtering, sorting, lookup-map construction, and fallback
  selection when they obscure the final response projection.
- Bind a value once when multiple later steps use it, rather than repeating a
  lookup or transformation. Keep the binding at the original first-use point.
- For infallible named intermediate values, use `Result.bind` with
  `Result.succeed` and an explicit `Result.Result<Value, never>` callback return
  type. Do not manually rebuild the full pipeline state just to add a property.

Do not add steps merely for every expression or trivial one-off output field.
Keep lookup/conversion together as specified by "Combine lookup and conversion",
and keep final projections inline as specified by "Result callback return
types".

Step-only refactors must preserve query, validation, conversion, and side-effect
order; conditional bypasses and empty-list guards; missing-value behavior and
error precedence; and transaction/retry boundaries. Do not split a transaction
or retry into pipeline steps, introduce new existence failures, or move
post-persistence selection before persistence.

```ts
Result.bind(
  'projectIds',
  (v): Result.Result<string[], never> =>
    Result.succeed(
      v.userMemberEnts.map(userMemberEnt => userMemberEnt.projectId)
    )
);
```

### Pipe step callbacks

Pass an inline callback to every Result combinator used as a `Result.pipe` step.
Name the callback argument `v`. Do not pass a named function directly as the
callback; wrap the call and project the required pipeline state explicitly.

Named functions still use `item` as required by the function argument rule.

```ts
// correct
Result.andThrough(v =>
  validateModel({
    modelId: v.modelId
  })
);

// wrong
Result.andThrough(validateModel);
```

### Pipe step argument types

Do not annotate the type of `v` in callbacks passed directly as `Result.pipe`
steps. Rely on contextual inference from the preceding pipeline state.

### Guard optional operations at caller

When a Result-producing operation depends on an optional value, handle the
absent case in the caller. Pass the narrowed, required value to the callee.

Do not make a callee accept an optional value solely so it can return a neutral
`Result.succeed` when the value is absent.

Keep the optional-value guard in the callee only when absence is intrinsic
domain behavior shared by multiple callers.

```ts
// correct
return isUndefined(v.name) ? Result.succeed() : printName({ name: v.name });

function printName(item: {
  name: string;
}): Result.Result<void, PrintNameError> {
  // ...
}

// wrong
function printName(item: {
  name?: string;
}): Result.Result<void, PrintNameError> {
  if (isUndefined(item.name)) {
    return Result.succeed();
  }

  // ...
}
```
