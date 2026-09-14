import {
  ZodArray,
  ZodCatch,
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

function applyMetaWithoutId<T extends z.ZodType>(result: T, src: unknown): T {
  let meta = getMeta(src);
  if (meta === undefined) {
    return result;
  }

  let nextMeta = { ...meta };
  delete nextMeta.id;

  if (Object.keys(nextMeta).length === 0) {
    return result;
  }

  return result.meta(nextMeta) as T;
}

function rebuild<T extends z.core.SomeType>(
  schema: T,
  overrides: Record<string, unknown>
): any {
  let anySchema = schema as any;
  let cloned = anySchema.clone({ ...anySchema.def, ...overrides });
  return applyMetaWithoutId(cloned, schema);
}

function zodStripMcpSchemaIdInternal<T extends z.core.SomeType>(
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
  if (schema instanceof ZodArray) {
    let element = zodStripMcpSchemaIdInternal(schema.def.element, cache);
    return rebuild(schema, { element: element });
  }

  if (schema instanceof ZodObject) {
    let shape = schema.shape;
    let newShape: Record<string, any> = {};
    Object.entries(shape).forEach(([key, value]) => {
      newShape[key] = zodStripMcpSchemaIdInternal(value, cache);
    });
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
    let inner = zodStripMcpSchemaIdInternal(schema.def.innerType, cache);
    return rebuild(schema, { innerType: inner });
  }

  if (schema instanceof ZodMap) {
    let keyType = zodStripMcpSchemaIdInternal(schema.def.keyType, cache);
    let valueType = zodStripMcpSchemaIdInternal(schema.def.valueType, cache);
    return rebuild(schema, { keyType: keyType, valueType: valueType });
  }

  if (schema instanceof ZodSet) {
    let valueType = zodStripMcpSchemaIdInternal(schema.def.valueType, cache);
    return rebuild(schema, { valueType: valueType });
  }

  if (schema instanceof ZodRecord) {
    let keyType = zodStripMcpSchemaIdInternal(schema.def.keyType, cache);
    let valueType = zodStripMcpSchemaIdInternal(schema.def.valueType, cache);
    return rebuild(schema, { keyType: keyType, valueType: valueType });
  }

  if (schema instanceof ZodUnion) {
    let newOptions = schema.def.options.map((opt: any) =>
      zodStripMcpSchemaIdInternal(opt, cache)
    );
    return rebuild(schema, { options: newOptions });
  }

  if (schema instanceof ZodIntersection) {
    let left = zodStripMcpSchemaIdInternal(schema.def.left, cache);
    let right = zodStripMcpSchemaIdInternal(schema.def.right, cache);
    return rebuild(schema, { left: left, right: right });
  }

  if (schema instanceof ZodTuple) {
    let items = schema.def.items.map((item: any) =>
      zodStripMcpSchemaIdInternal(item, cache)
    );
    let rest = schema.def.rest
      ? zodStripMcpSchemaIdInternal(schema.def.rest, cache)
      : schema.def.rest;
    return rebuild(schema, { items: items, rest: rest });
  }

  if (schema instanceof ZodLazy) {
    let originalGetter = schema.def.getter;
    return rebuild(schema, {
      getter: () => zodStripMcpSchemaIdInternal(originalGetter(), cache)
    });
  }

  if (schema instanceof ZodPipe) {
    let in_ = zodStripMcpSchemaIdInternal(schema.def.in, cache);
    let out = zodStripMcpSchemaIdInternal(schema.def.out, cache);
    return rebuild(schema, { in: in_, out: out });
  }

  return rebuild(schema, {});
}

export function zodStripMcpSchemaId<T extends z.core.SomeType>(item: {
  schema: T;
}): T {
  let { schema } = item;
  let cache: WeakMap<object, any> = new WeakMap();
  return zodStripMcpSchemaIdInternal(schema, cache);
}
