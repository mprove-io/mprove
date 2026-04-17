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
//
// Delta #8: `ZodCustom` branch substitutes `z.any()` for `z.custom<T>()`.
// `z.custom<>()` has no JSON Schema representation in zod v4: its
// `customProcessor` throws when `z.toJSONSchema()` walks it, which is what
// `@rekog/mcp-nest` does at bootstrap on every `@Tool` output. Replacing with
// `z.any()` (which renders as `{}`) unblocks emission. Source-schema `.meta()`
// is forwarded onto the `z.any()` replacement so any description / title /
// external-docs metadata still appears in the emitted JSON Schema. Safe:
//   - source schemas are untouched, so consumer TS types still infer the real
//     `T` from `z.custom<T>()`;
//   - at runtime, `z.custom()` with no refine is a no-op validator — identical
//     to `z.any()` — so pass-through behavior is unchanged.

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

// Rebuild a compound schema with `overrides` merged into its `def`, so
// `.min()/.max()/.length()` checks, `.catchall()`, error messages, and other
// def-level fields survive (rebuilding via `z.array(...)` / `z.object(...)`
// etc. would drop everything the factory helper doesn't accept). `clone`
// dispatches on `_zod.constr`, so subclasses (e.g. `ZodDiscriminatedUnion`)
// are rebuilt as their own type.
function rebuild<T extends z.core.SomeType>(
  schema: T,
  overrides: Record<string, unknown>
): any {
  let anySchema = schema as any;
  return anySchema.clone({ ...anySchema.def, ...overrides });
}

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
  //
  // Delta #7: pre-seed the cache with a `z.lazy()` placeholder before calling
  // `buildNullish`. Required after `zModelNode` / `zDiskCatalogNode` migrated
  // away from top-level `z.lazy()` to getter-based recursion: those schemas
  // are now plain `ZodObject`s whose `children` getter recursively
  // re-references the same instance. The previous code only `cache.set`-ed
  // *after* `buildNullish` returned, so a self-reference during the build hit
  // a cache miss and infinite-looped. The placeholder resolves any in-flight
  // self-reference through `resultRef.current`, which is filled in once
  // `buildNullish` completes.

  // Previous body:
  // let cached = cache.get(schema);
  // if (cached !== undefined) {
  //   return cached;
  // }
  // let result = buildNullish(schema, isTopLevel, cache);
  // cache.set(schema, result);
  // return result;

  let cached = cache.get(schema);
  if (cached !== undefined) {
    return cached;
  }
  let resultRef: { current: any } = { current: undefined };
  cache.set(
    schema,
    z.lazy(() => resultRef.current)
  );
  let result = buildNullish(schema, isTopLevel, cache);
  resultRef.current = result;
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
    //
    // Delta #9: rebuild via `schema.clone({ ...def, shape: newShape })` instead
    // of `z.object(newShape)` so the source object's `.catchall()`, error
    // messages, and other non-shape def fields survive the transformation.
    let result: z.ZodType = rebuild(schema, { shape: newShape });

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

  // Delta #9: every compound-schema branch below rebuilds via
  // `rebuild(schema, { ...swapped children })` instead of `z.array(...)`,
  // `z.union(...)`, etc. so array `.min()/.max()/.length()`, map/set/record
  // size checks, union/intersection-level checks, tuple `rest`, lazy-loader
  // metadata, and any attached error/refine are preserved. `rebuild` calls
  // `schema.clone(...)`, which dispatches through `_zod.constr`, so a
  // `ZodDiscriminatedUnion` flowing through the `ZodUnion` branch is rebuilt
  // as a discriminated union and its `discriminator`/`unionFallback` def
  // fields ride along.
  if (schema instanceof ZodArray) {
    let element = zodDeepNullishInternal(schema.def.element, false, cache);
    return rebuild(schema, { element: element }).nullish();
  }

  if (schema instanceof ZodMap) {
    let keyType = zodDeepNullishInternal(schema.def.keyType, false, cache);
    let valueType = zodDeepNullishInternal(schema.def.valueType, false, cache);
    return rebuild(schema, {
      keyType: keyType,
      valueType: valueType
    }).nullish();
  }

  if (schema instanceof ZodSet) {
    let valueType = zodDeepNullishInternal(schema.def.valueType, false, cache);
    return rebuild(schema, { valueType: valueType }).nullish();
  }

  if (schema instanceof ZodPromise) {
    let innerType = zodDeepNullishInternal(schema.def.innerType, false, cache);
    return rebuild(schema, { innerType: innerType }).nullish();
  }

  if (schema instanceof ZodUnion) {
    // Handles both `ZodUnion` and `ZodDiscriminatedUnion` (which extends
    // `ZodUnion` via the zod v4 trait set). No separate `ZodDiscriminatedUnion`
    // branch is needed — `clone` uses the original constructor, so the
    // rebuild comes back as the right subtype.
    let newOptions = schema.def.options.map((opt: any) =>
      zodDeepNullishInternal(opt, false, cache)
    );
    return rebuild(schema, { options: newOptions }).nullish();
  }

  if (schema instanceof ZodIntersection) {
    let left = zodDeepNullishInternal(schema.def.left, false, cache);
    let right = zodDeepNullishInternal(schema.def.right, false, cache);
    return rebuild(schema, { left: left, right: right }).nullish();
  }

  if (schema instanceof ZodRecord) {
    let keyType = zodDeepNullishInternal(schema.def.keyType, false, cache);
    let valueType = zodDeepNullishInternal(schema.def.valueType, false, cache);
    return rebuild(schema, {
      keyType: keyType,
      valueType: valueType
    }).nullish();
  }

  if (schema instanceof ZodTuple) {
    let items = schema.def.items.map((item: any) =>
      zodDeepNullishInternal(item, false, cache)
    );
    let rest = schema.def.rest
      ? zodDeepNullishInternal(schema.def.rest, false, cache)
      : schema.def.rest;
    return rebuild(schema, { items: items, rest: rest }).nullish();
  }

  if (schema instanceof ZodLazy) {
    let originalGetter = schema.def.getter;
    return rebuild(schema, {
      getter: () => zodDeepNullishInternal(originalGetter(), false, cache)
    }).nullish();
  }

  if (schema instanceof ZodPipe) {
    return schema;
  }

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
    return replacement.nullish();
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
