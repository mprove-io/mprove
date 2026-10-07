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
import {
  ZodArray,
  ZodCatch,
  ZodCustom,
  ZodDefault,
  ZodIntersection,
  ZodLazy,
  ZodMap,
  ZodNonOptional,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodPipe,
  ZodPrefault,
  ZodPromise,
  ZodReadonly,
  ZodRecord,
  ZodSet,
  ZodTuple,
  ZodUnion,
  z
} from 'zod';
import { applyMeta } from '#backend/functions/zod/apply-meta/apply-meta';
import { rebuildZodCustomSchema } from '#backend/functions/zod/zod-strip-custom-internal/build-custom-stripped-schema/rebuild-zod-custom-schema/rebuild-zod-custom-schema';
import { zodStripCustomInternal } from '#backend/functions/zod/zod-strip-custom-internal/zod-strip-custom-internal';
export function buildCustomStrippedSchema<T extends z.core.SomeType>(
  schema: T,
  cache: WeakMap<object, any>
): any {
  if (schema instanceof ZodCustom) {
    // The sole intended transformation: replace custom types with `z.any()`
    // so the schema is representable in JSON Schema. Keep meta so ids,
    // descriptions, and other annotations survive.
    return applyMeta(z.any(), schema);
  }
  if (schema instanceof ZodArray) {
    let element = zodStripCustomInternal(schema.def.element, cache);
    return rebuildZodCustomSchema(schema, { element: element });
  }
  if (schema instanceof ZodObject) {
    let shape = schema.shape;
    let newShape: Record<string, any> = {};
    for (let key in shape) {
      newShape[key] = zodStripCustomInternal(shape[key], cache);
    }
    return rebuildZodCustomSchema(schema, { shape: newShape });
  }
  if (
    schema instanceof ZodOptional ||
    schema instanceof ZodNullable ||
    schema instanceof ZodDefault ||
    schema instanceof ZodCatch ||
    schema instanceof ZodPrefault ||
    schema instanceof ZodNonOptional ||
    schema instanceof ZodReadonly ||
    schema instanceof ZodPromise
  ) {
    let inner = zodStripCustomInternal(schema.def.innerType, cache);
    return rebuildZodCustomSchema(schema, { innerType: inner });
  }
  if (schema instanceof ZodMap) {
    let keyType = zodStripCustomInternal(schema.def.keyType, cache);
    let valueType = zodStripCustomInternal(schema.def.valueType, cache);
    return rebuildZodCustomSchema(schema, {
      keyType: keyType,
      valueType: valueType
    });
  }
  if (schema instanceof ZodSet) {
    let valueType = zodStripCustomInternal(schema.def.valueType, cache);
    return rebuildZodCustomSchema(schema, { valueType: valueType });
  }
  if (schema instanceof ZodRecord) {
    let keyType = zodStripCustomInternal(schema.def.keyType, cache);
    let valueType = zodStripCustomInternal(schema.def.valueType, cache);
    return rebuildZodCustomSchema(schema, {
      keyType: keyType,
      valueType: valueType
    });
  }
  if (schema instanceof ZodUnion) {
    // Handles both `ZodUnion` and `ZodDiscriminatedUnion` (which extends
    // `ZodUnion` via trait set). `clone` dispatches on `_zod.constr`, so a
    // discriminated union is rebuilt as a discriminated union — its
    // discriminator field and `unionFallback` flag live in `def` and ride
    // along automatically.
    let newOptions = schema.def.options.map((opt: any) =>
      zodStripCustomInternal(opt, cache)
    );
    return rebuildZodCustomSchema(schema, { options: newOptions });
  }
  if (schema instanceof ZodIntersection) {
    let left = zodStripCustomInternal(schema.def.left, cache);
    let right = zodStripCustomInternal(schema.def.right, cache);
    return rebuildZodCustomSchema(schema, { left: left, right: right });
  }
  if (schema instanceof ZodTuple) {
    let items = schema.def.items.map((item: any) =>
      zodStripCustomInternal(item, cache)
    );
    let rest = schema.def.rest
      ? zodStripCustomInternal(schema.def.rest, cache)
      : schema.def.rest;
    return rebuildZodCustomSchema(schema, { items: items, rest: rest });
  }
  if (schema instanceof ZodLazy) {
    let originalGetter = schema.def.getter;
    return rebuildZodCustomSchema(schema, {
      getter: () => zodStripCustomInternal(originalGetter(), cache)
    });
  }
  if (schema instanceof ZodPipe) {
    let in_ = zodStripCustomInternal(schema.def.in, cache);
    let out = zodStripCustomInternal(schema.def.out, cache);
    return rebuildZodCustomSchema(schema, { in: in_, out: out });
  }
  // Leaf types (ZodString, ZodNumber, ZodBoolean, ZodLiteral, ZodEnum,
  // ZodDate, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodNull, ZodUndefined,
  // ZodNaN, ZodBigInt, ZodSymbol, ZodFile, ZodTemplateLiteral) have no
  // child schemas to recurse into, so return as-is with all their checks
  // and metadata intact via reference.
  return schema;
}
