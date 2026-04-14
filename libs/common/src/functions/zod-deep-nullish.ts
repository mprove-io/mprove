// Port of the `zod-deep-partial` library, but produces nullish (null | undefined)
// instead of optional (undefined-only) wrappers. See:
//   external/zod-deep-partial/src/index.ts (runtime)
//   external/zod-deep-partial/src/types.ts (DeepPartial mapped type)
//
// Deltas vs. the upstream library:
//   1. `.optional()` → `.nullish()` on every shape value, branch return, and the
//      type-level fallback / object-shape wrapper. This is the whole point of the
//      port: tool outputs from LLMs may emit explicit `null` for missing fields,
//      so we accept `T | null | undefined` rather than just `T | undefined`.
//   2. ZodObject branch drops the trailing `.partial()` call. The library writes
//      `z.object(newShape).partial()` after wrapping each key in `.optional()`,
//      which double-wraps. With `.nullish()` already applied per key, `.partial()`
//      would be a no-op, so it is omitted.
//   3. Public function takes `{ schema }` instead of a positional schema arg, per
//      the repo's single-object-arg convention (see CLAUDE.md "Function and method args").
//   4. `let` instead of `const`, per repo style.

import {
  ZodArray,
  ZodCatch,
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

export type DeepNullish<T extends z.core.SomeType> =
  T extends ZodOptional<infer Inner>
    ? ZodOptional<DeepNullish<Inner>>
    : T extends ZodNullable<infer Inner>
      ? ZodNullable<DeepNullish<Inner>>
      : T extends ZodDefault<infer Inner>
        ? ZodDefault<DeepNullish<Inner>>
        : T extends ZodCatch<infer Inner>
          ? ZodCatch<DeepNullish<Inner>>
          : T extends ZodPrefault<infer Inner>
            ? ZodPrefault<DeepNullish<Inner>>
            : T extends ZodNonOptional<infer Inner>
              ? ZodNonOptional<DeepNullish<Inner>>
              : T extends ZodReadonly<infer Inner>
                ? ZodReadonly<DeepNullish<Inner>>
                : T extends ZodObject<infer Shape>
                  ? ZodObject<{
                      // Delta #1: `ZodOptional<DeepPartial<...>>` in the lib becomes
                      // `ZodOptional<ZodNullable<DeepNullish<...>>>` here — that is the
                      // type-level shape of `.nullish()` in zod v4.
                      [K in keyof Shape]: ZodOptional<
                        ZodNullable<DeepNullish<Shape[K]>>
                      >;
                    }>
                  : T extends ZodArray<infer Type>
                    ? ZodArray<DeepNullish<Type>>
                    : T extends ZodMap<infer Key, infer Value>
                      ? ZodMap<Key, DeepNullish<Value>>
                      : T extends ZodSet<infer Type>
                        ? ZodSet<DeepNullish<Type>>
                        : T extends ZodPromise<infer Type>
                          ? ZodPromise<DeepNullish<Type>>
                          : T extends ZodUnion<infer Options>
                            ? ZodUnion<{
                                [K in keyof Options]: DeepNullish<Options[K]>;
                              }>
                            : T extends ZodIntersection<infer Left, infer Right>
                              ? ZodIntersection<
                                  DeepNullish<Left>,
                                  DeepNullish<Right>
                                >
                              : T extends ZodRecord<infer Key, infer Value>
                                ? ZodRecord<Key, DeepNullish<Value>>
                                : T extends ZodTuple<infer Items>
                                  ? ZodTuple<
                                      {
                                        [K in keyof Items]: DeepNullish<
                                          Items[K]
                                        >;
                                      } extends infer U
                                        ? U extends any[]
                                          ? U
                                          : never
                                        : never
                                    >
                                  : T extends ZodPipe<infer In, infer Out>
                                    ? ZodPipe<In, Out>
                                    : T extends ZodLazy<infer Type>
                                      ? ZodLazy<DeepNullish<Type>>
                                      : // Delta #1: fallback is `ZodOptional<ZodNullable<T>>`
                                        // (lib has `ZodOptional<T>`).
                                        ZodOptional<ZodNullable<T>>;

function zodDeepNullishInternal<T extends z.core.SomeType>(
  schema: T,
  isTopLevel: boolean,
  cache: WeakMap<object, any>
): any {
  // Delta #5: memoize transformations by source schema instance. Without this,
  // a shared sub-schema (e.g. `zRunQuery` reached through both `zRunChart` and
  // `zRunDashboard → zRunTile`) gets rebuilt into multiple distinct nullish
  // variants, all carrying the same `*Nullish` meta id. `z.toJSONSchema`
  // rejects that with "Duplicate schema id". Memoizing keeps one variant per
  // source, preserving referential identity across parents.
  let cached = cache.get(schema);
  if (cached !== undefined) {
    return cached;
  }

  let result = buildNullish(schema, isTopLevel, cache);
  cache.set(schema, result);
  return result;
}

function buildNullish<T extends z.core.SomeType>(
  schema: T,
  isTopLevel: boolean,
  cache: WeakMap<object, any>
): any {
  if (schema instanceof ZodOptional) {
    return zodDeepNullishInternal(schema.unwrap(), false, cache).optional();
  }

  if (schema instanceof ZodNullable) {
    return zodDeepNullishInternal(schema.unwrap(), false, cache).nullable();
  }

  if (schema instanceof ZodDefault) {
    let innerResult = zodDeepNullishInternal(schema.unwrap(), false, cache);
    return innerResult.default(schema.def.defaultValue);
  }

  if (schema instanceof ZodCatch) {
    let innerResult = zodDeepNullishInternal(
      schema.def.innerType,
      false,
      cache
    );
    return innerResult.catch(schema.def.catchValue);
  }

  if (schema instanceof ZodPrefault) {
    let innerResult = zodDeepNullishInternal(
      schema.def.innerType,
      false,
      cache
    );
    return innerResult.prefault(schema.def.defaultValue);
  }

  if (schema instanceof ZodNonOptional) {
    let innerResult = zodDeepNullishInternal(
      schema.def.innerType,
      false,
      cache
    );
    return innerResult.nonoptional();
  }

  if (schema instanceof ZodReadonly) {
    return zodDeepNullishInternal(
      schema.def.innerType,
      false,
      cache
    ).readonly();
  }

  if (schema instanceof ZodObject) {
    let shape = schema.shape;
    let newShape: Record<string, any> = {};

    for (let key in shape) {
      newShape[key] = zodDeepNullishInternal(
        shape[key],
        false,
        cache
      ).nullish();
    }

    // Delta #2: lib calls `z.object(newShape).partial()` here. We omit `.partial()`
    // because each key is already `.nullish()` (which makes the key optional too),
    // so `.partial()` would be a no-op double-wrap.
    let result: z.ZodType = z.object(newShape);

    if (isTopLevel) {
      result = (result as z.ZodObject).strict();
    }

    // Delta #4: preserve source `.meta({ id })` with a `Nullish` suffix so
    // the nullish-transformed schema appears as a reusable $defs entry in
    // `z.toJSONSchema` output (a $ref at each use site), rather than being
    // inlined in full at every occurrence. The suffix keeps the nullish id
    // distinct from the strict id to avoid collisions if both ever appear
    // in the same JSON Schema document.
    let srcMeta = (
      schema as unknown as { meta?: () => { id?: string } | undefined }
    ).meta?.();
    if (typeof srcMeta?.id === 'string') {
      result = result.meta({ id: `${srcMeta.id}Nullish` });
    }

    return result;
  }

  if (schema instanceof ZodArray) {
    return z
      .array(zodDeepNullishInternal(schema.def.element, false, cache))
      .nullish();
  }

  if (schema instanceof ZodMap) {
    return z
      .map(
        zodDeepNullishInternal(schema.def.keyType, false, cache),
        zodDeepNullishInternal(schema.def.valueType, false, cache)
      )
      .nullish();
  }

  if (schema instanceof ZodSet) {
    return z
      .set(zodDeepNullishInternal(schema.def.valueType, false, cache))
      .nullish();
  }

  if (schema instanceof ZodPromise) {
    return z
      .promise(zodDeepNullishInternal(schema.def.innerType, false, cache))
      .nullish();
  }

  if (schema instanceof ZodUnion) {
    return z
      .union(
        schema.options.map((opt: any) =>
          zodDeepNullishInternal(opt, false, cache)
        )
      )
      .nullish();
  }

  if (schema instanceof ZodIntersection) {
    return z
      .intersection(
        zodDeepNullishInternal(schema.def.left, false, cache),
        zodDeepNullishInternal(schema.def.right, false, cache)
      )
      .nullish();
  }

  if (schema instanceof ZodRecord) {
    return z
      .record(
        zodDeepNullishInternal(schema.def.keyType, false, cache),
        zodDeepNullishInternal(schema.def.valueType, false, cache)
      )
      .nullish();
  }

  if (schema instanceof ZodTuple) {
    return z
      .tuple(
        schema.def.items.map((item: any) =>
          zodDeepNullishInternal(item, false, cache)
        ) as any
      )
      .nullish();
  }

  if (schema instanceof ZodLazy) {
    return z
      .lazy(() => zodDeepNullishInternal(schema.def.getter(), false, cache))
      .nullish();
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
            newShape[key] = zodDeepNullishInternal(
              shape[key],
              false,
              cache
            ).nullish();
          }
        }

        return z.object(newShape);
      }
      return zodDeepNullishInternal(option, false, cache);
    });

    return z.discriminatedUnion(schema.def.discriminator, options as any);
  }

  if (schema instanceof ZodPipe) {
    return schema;
  }

  return (schema as any).nullish();
}

// Delta #3: lib signature is `zodDeepPartial(schema)`. We use `{ schema }`
// per repo convention (CLAUDE.md → "Function and method args").

// Delta #6: cache is module-scoped (shared across every `zodDeepNullish` call)
// rather than per-call. Two callers that pass schemas which share a sub-schema
// (e.g. `zMproveValidationError` referenced from both `zMcpToolValidateFilesOutput`
// and `zMcpToolGetStateOutput`) must produce the SAME nullish-transformed
// instance for that shared piece — otherwise both calls each build a distinct
// `MproveValidationErrorNullish` schema with the same meta id, and any later
// `z.toJSONSchema` pass over both throws "Duplicate schema id". A single cache
// across calls preserves referential identity and is safe because zod schemas
// are immutable after construction.
let zodDeepNullishCache: WeakMap<object, any> = new WeakMap();

export function zodDeepNullish<T extends z.core.SomeType>(item: {
  schema: T;
}): DeepNullish<T> {
  let { schema } = item;
  return zodDeepNullishInternal(schema, true, zodDeepNullishCache);
}
