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

function getMeta(schema: unknown): Record<string, unknown> | undefined {
  return (
    schema as { meta?: () => Record<string, unknown> | undefined }
  ).meta?.();
}

function applyMeta<T extends z.ZodType>(result: T, src: unknown): T {
  let meta = getMeta(src);
  if (meta && Object.keys(meta).length > 0) {
    return result.meta(meta) as T;
  }
  return result;
}

function rebuild<T extends z.core.SomeType>(
  schema: T,
  overrides: Record<string, unknown>
): any {
  let anySchema = schema as any;
  let cloned = anySchema.clone({ ...anySchema.def, ...overrides });
  return applyMeta(cloned, schema);
}

function zodStripCustomInternal<T extends z.core.SomeType>(
  schema: T,
  cache: WeakMap<object, any>
): any {
  let cached = cache.get(schema);
  if (cached !== undefined) {
    return cached;
  }
  let resultRef: { current: any } = { current: undefined };
  cache.set(
    schema,
    z.lazy(() => resultRef.current)
  );
  let result = buildStripped(schema, cache);
  resultRef.current = result;
  cache.set(schema, result);
  return result;
}

function buildStripped<T extends z.core.SomeType>(
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
    return rebuild(schema, { element: element });
  }

  if (schema instanceof ZodObject) {
    let shape = schema.shape;
    let newShape: Record<string, any> = {};
    for (let key in shape) {
      newShape[key] = zodStripCustomInternal(shape[key], cache);
    }
    return rebuild(schema, { shape: newShape });
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
    return rebuild(schema, { innerType: inner });
  }

  if (schema instanceof ZodMap) {
    let keyType = zodStripCustomInternal(schema.def.keyType, cache);
    let valueType = zodStripCustomInternal(schema.def.valueType, cache);
    return rebuild(schema, { keyType: keyType, valueType: valueType });
  }

  if (schema instanceof ZodSet) {
    let valueType = zodStripCustomInternal(schema.def.valueType, cache);
    return rebuild(schema, { valueType: valueType });
  }

  if (schema instanceof ZodRecord) {
    let keyType = zodStripCustomInternal(schema.def.keyType, cache);
    let valueType = zodStripCustomInternal(schema.def.valueType, cache);
    return rebuild(schema, { keyType: keyType, valueType: valueType });
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
    return rebuild(schema, { options: newOptions });
  }

  if (schema instanceof ZodIntersection) {
    let left = zodStripCustomInternal(schema.def.left, cache);
    let right = zodStripCustomInternal(schema.def.right, cache);
    return rebuild(schema, { left: left, right: right });
  }

  if (schema instanceof ZodTuple) {
    let items = schema.def.items.map((item: any) =>
      zodStripCustomInternal(item, cache)
    );
    let rest = schema.def.rest
      ? zodStripCustomInternal(schema.def.rest, cache)
      : schema.def.rest;
    return rebuild(schema, { items: items, rest: rest });
  }

  if (schema instanceof ZodLazy) {
    let originalGetter = schema.def.getter;
    return rebuild(schema, {
      getter: () => zodStripCustomInternal(originalGetter(), cache)
    });
  }

  if (schema instanceof ZodPipe) {
    let in_ = zodStripCustomInternal(schema.def.in, cache);
    let out = zodStripCustomInternal(schema.def.out, cache);
    return rebuild(schema, { in: in_, out: out });
  }

  // Leaf types (ZodString, ZodNumber, ZodBoolean, ZodLiteral, ZodEnum,
  // ZodDate, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodNull, ZodUndefined,
  // ZodNaN, ZodBigInt, ZodSymbol, ZodFile, ZodTemplateLiteral) have no
  // child schemas to recurse into, so return as-is with all their checks
  // and metadata intact via reference.
  return schema;
}

let zodStripCustomCache: WeakMap<object, any> = new WeakMap();

export function zodStripCustom<T extends z.core.SomeType>(item: {
  schema: T;
}): T {
  let { schema } = item;
  return zodStripCustomInternal(schema, zodStripCustomCache);
}
