# Type-only imports

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
