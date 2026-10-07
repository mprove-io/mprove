// Deep walker that rebuilds a zod v4 schema with every `ZodCustom` replaced
// by `z.any()` (forwarding any source `.meta(...)` onto the replacement).
// Used at the OpenAPI emission boundary: `nestjs-zod`'s `createZodDto`
// calls `z.toJSONSchema()` internally without `unrepresentable: 'any'`, so
// a `z.custom<>()` anywhere in a DTO's schema graph would crash with
// "Custom types cannot be represented in JSON Schema". This preprocessor
// sidesteps that while keeping source schemas untouched — consumer TS types
// still infer the real `T` from `z.custom<T>()` at the source.
//
// Invariant: the only difference between the input and output schema is that
// every `ZodCustom` node is replaced with `z.any()`. Everything else — array
// `.min()/.max()/.length()`, string formats, object `.catchall()`, union
// discriminators, checks, error messages, metadata — is preserved by cloning
// each compound schema via its own `clone({ ...def, <children swapped> })`
// rather than by reconstructing it through `z.array(...)`, `z.object(...)`,
// etc. (which would drop every def field the factory helpers don't accept).
//
// Structure:
//   - module-scoped WeakMap cache so shared sub-schemas produce the same
//     rebuilt instance (preserves `$ref` reuse in JSON Schema output and
//     avoids "Duplicate schema id");
//   - `z.lazy()` placeholder pre-seeded before recursion to survive
//     self-referential getters (e.g. `zModelNode.children`).
import type { z } from 'zod';
import { getZodCustomMeta } from '#backend/functions/zod/apply-meta/get-zod-custom-meta/get-zod-custom-meta';
export function applyMeta<T extends z.ZodType>(result: T, src: unknown): T {
  let meta = getZodCustomMeta(src);
  if (meta && Object.keys(meta).length > 0) {
    return result.meta(meta) as T;
  }
  return result;
}
