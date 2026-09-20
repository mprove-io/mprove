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

```ts
export function doSomething(item: { orgId: string; projectId: string }) {
  let { orgId, projectId } = item;
  // ...
}
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

Inline a boolean expression in a condition when a variable would only store the
expression for that single condition. This includes function and method calls
that return a boolean.

When a function or method call returns a non-boolean value, assign its result to
an explicitly typed variable before evaluating that value in a condition.

Start boolean variable names with `is`. In particular, use `isOutputInParent`,
not `outputIsInParent`.

```ts
// correct: single-use boolean expression
if (manifestPath === outputPath) {

// correct: call returns a boolean
if (isDefined(member)) {

// correct: call returns a non-boolean value
let member: unknown = this.membersService.getMember(memberId);

if (!member) {

// wrong: unnecessary single-use boolean variable
let pathsConflict: boolean = manifestPath === outputPath;

if (pathsConflict) {

// correct: boolean variable starts with is
let isOutputInParent: boolean = relativeOutputPath === '..';

// wrong: is is in the middle
let outputIsInParent: boolean = relativeOutputPath === '..';

// wrong: call returns a non-boolean value
if (!this.membersService.getMember(memberId)) {
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
- Return a `ResultAsync` helper directly instead of wrapping it in redundant
  `async`/`await`.

Standalone Result-producing functions must retain explicit return types.

### Result callback return types

Callbacks passed to `Result.bind` and `Result.andThen` must declare an explicit
`Result.Result<Success, Error>` return type.

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

Keep a one-off final projection inline in the `Result.map` callback. Do not
extract it into a named function used only by that final projection.

```ts
Result.map(
  (v): SomeType => ({
    modelId: v.modelId,
    name: v.name
  })
);
```

Callbacks passed to `Result.andThrough` do not require an explicit return type.

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
- `map` transforms a success value without introducing an anticipated error.
- `mapError` transforms a failure value.
- `andThen` replaces a success with another Result-producing computation.
- `andThrough` runs a Result-producing validation or side effect and preserves
  the original success.
- `bind` adds a Result-producing computation's success under a named property.
  Do not bind `void` results or final projections.
- `orElse` replaces a failure with another Result-producing computation.
- `orThrough` runs a Result-producing operation on a failure and preserves the
  original failure when that operation succeeds.
- `inspect` runs an infallible side effect on a success without changing the
  result.
- `inspectError` runs an infallible side effect on a failure without changing
  the result.

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

### Pipe should start with result succeed

Every `Result.pipe` must start with `Result.succeed`.

### Pipe initial state

Use the function's original `item` argument directly as the initial pipeline
state when no additional or derived values are needed. Do not destructure `item`
before the pipeline in this case.

```ts
return Result.pipe(
  Result.succeed(item),
  Result.andThen(
    (v): Result.Result<Something, DoSomethingError> => doSomething(v)
  )
);
```

When the initial pipeline state differs from `item`, pass it as an explicit
object rather than passing an individual property or derived value directly.

```ts
return Result.pipe(
  Result.succeed({
    orgId: orgId,
    projectId: projectId,
    model: model
  }),
  Result.andThen(
    (v): Result.Result<Something, DoSomethingError> => doSomething(v)
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

### Pipe state access

After the initial `Result.succeed`, access pipeline data only through `v`. Do
not reference `item`, destructured item properties, or variables declared before
`Result.pipe`. Carry all required data through the pipeline state.
