// Deep walker that rebuilds a zod v4 schema with every `ZodCustom` replaced
// by `z.any()` (forwarding any source `.meta(...)` onto the replacement).
// Used at the OpenAPI emission boundary: `nestjs-zod`'s `createZodDto`
// calls `z.toJSONSchema()` internally without `unrepresentable: 'any'`, so
// a `z.custom<>()` anywhere in a DTO's schema graph would crash with
// "Custom types cannot be represented in JSON Schema". This preprocessor
// sidesteps that while keeping source schemas untouched — consumer TS types
// still infer the real `T` from `z.custom<T>()` at the source.
//
// Structure mirrors `zod-deep-nullish.ts` but without the nullish wrapping:
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
  ZodDiscriminatedUnion,
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
    let replacement: z.ZodType = z.any();
    let srcMeta = (
      schema as unknown as {
        meta?: () => Record<string, unknown> | undefined;
      }
    ).meta?.();
    if (srcMeta && Object.keys(srcMeta).length > 0) {
      replacement = replacement.meta(srcMeta);
    }
    return replacement;
  }

  if (schema instanceof ZodOptional) {
    return zodStripCustomInternal(schema.unwrap(), cache).optional();
  }

  if (schema instanceof ZodNullable) {
    return zodStripCustomInternal(schema.unwrap(), cache).nullable();
  }

  if (schema instanceof ZodDefault) {
    let innerResult = zodStripCustomInternal(schema.unwrap(), cache);
    return innerResult.default(schema.def.defaultValue);
  }

  if (schema instanceof ZodCatch) {
    let innerResult = zodStripCustomInternal(schema.def.innerType, cache);
    return innerResult.catch(schema.def.catchValue);
  }

  if (schema instanceof ZodPrefault) {
    let innerResult = zodStripCustomInternal(schema.def.innerType, cache);
    return innerResult.prefault(schema.def.defaultValue);
  }

  if (schema instanceof ZodNonOptional) {
    let innerResult = zodStripCustomInternal(schema.def.innerType, cache);
    return innerResult.nonoptional();
  }

  if (schema instanceof ZodReadonly) {
    return zodStripCustomInternal(schema.def.innerType, cache).readonly();
  }

  if (schema instanceof ZodObject) {
    let shape = schema.shape;
    let newShape: Record<string, any> = {};

    for (let key in shape) {
      newShape[key] = zodStripCustomInternal(shape[key], cache);
    }

    let result: z.ZodType = z.object(newShape);

    let srcMeta = (
      schema as unknown as {
        meta?: () => Record<string, unknown> | undefined;
      }
    ).meta?.();
    if (srcMeta && Object.keys(srcMeta).length > 0) {
      result = result.meta(srcMeta);
    }

    return result;
  }

  if (schema instanceof ZodArray) {
    return z.array(zodStripCustomInternal(schema.def.element, cache));
  }

  if (schema instanceof ZodMap) {
    return z.map(
      zodStripCustomInternal(schema.def.keyType, cache),
      zodStripCustomInternal(schema.def.valueType, cache)
    );
  }

  if (schema instanceof ZodSet) {
    return z.set(zodStripCustomInternal(schema.def.valueType, cache));
  }

  if (schema instanceof ZodPromise) {
    return z.promise(zodStripCustomInternal(schema.def.innerType, cache));
  }

  if (schema instanceof ZodUnion) {
    return z.union(
      schema.options.map((opt: any) => zodStripCustomInternal(opt, cache))
    );
  }

  if (schema instanceof ZodIntersection) {
    return z.intersection(
      zodStripCustomInternal(schema.def.left, cache),
      zodStripCustomInternal(schema.def.right, cache)
    );
  }

  if (schema instanceof ZodRecord) {
    return z.record(
      zodStripCustomInternal(schema.def.keyType, cache),
      zodStripCustomInternal(schema.def.valueType, cache)
    );
  }

  if (schema instanceof ZodTuple) {
    return z.tuple(
      schema.def.items.map((item: any) =>
        zodStripCustomInternal(item, cache)
      ) as any
    );
  }

  if (schema instanceof ZodLazy) {
    return z.lazy(() => zodStripCustomInternal(schema.def.getter(), cache));
  }

  if (schema instanceof ZodDiscriminatedUnion) {
    let options = schema.options.map((option: any) => {
      if (option instanceof ZodObject) {
        let shape = option.shape;
        let newShape: Record<string, any> = {};

        for (let key in shape) {
          if (key === schema.def.discriminator) {
            newShape[key] = shape[key];
          } else {
            newShape[key] = zodStripCustomInternal(shape[key], cache);
          }
        }

        return z.object(newShape);
      }
      return zodStripCustomInternal(option, cache);
    });

    return z.discriminatedUnion(schema.def.discriminator, options as any);
  }

  if (schema instanceof ZodPipe) {
    return schema;
  }

  return schema;
}

let zodStripCustomCache: WeakMap<object, any> = new WeakMap();

export function zodStripCustom<T extends z.core.SomeType>(item: {
  schema: T;
}): T {
  let { schema } = item;
  return zodStripCustomInternal(schema, zodStripCustomCache);
}
