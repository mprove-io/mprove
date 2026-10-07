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
  type z
} from 'zod';
import { rebuildZodMcpSchema } from '#backend/functions/zod/zod-strip-mcp-schema-id-internal/build-mcp-schema-id-stripped-schema/rebuild-zod-mcp-schema/rebuild-zod-mcp-schema';
import { zodStripMcpSchemaIdInternal } from '#backend/functions/zod/zod-strip-mcp-schema-id-internal/zod-strip-mcp-schema-id-internal';
export function buildMcpSchemaIdStrippedSchema<T extends z.core.SomeType>(
  schema: T,
  cache: WeakMap<object, any>
): any {
  if (schema instanceof ZodArray) {
    let element = zodStripMcpSchemaIdInternal(schema.def.element, cache);
    return rebuildZodMcpSchema(schema, { element: element });
  }
  if (schema instanceof ZodObject) {
    let shape = schema.shape;
    let newShape: Record<string, any> = {};
    Object.entries(shape).forEach(([key, value]) => {
      newShape[key] = zodStripMcpSchemaIdInternal(value, cache);
    });
    return rebuildZodMcpSchema(schema, { shape: newShape });
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
    return rebuildZodMcpSchema(schema, { innerType: inner });
  }
  if (schema instanceof ZodMap) {
    let keyType = zodStripMcpSchemaIdInternal(schema.def.keyType, cache);
    let valueType = zodStripMcpSchemaIdInternal(schema.def.valueType, cache);
    return rebuildZodMcpSchema(schema, {
      keyType: keyType,
      valueType: valueType
    });
  }
  if (schema instanceof ZodSet) {
    let valueType = zodStripMcpSchemaIdInternal(schema.def.valueType, cache);
    return rebuildZodMcpSchema(schema, { valueType: valueType });
  }
  if (schema instanceof ZodRecord) {
    let keyType = zodStripMcpSchemaIdInternal(schema.def.keyType, cache);
    let valueType = zodStripMcpSchemaIdInternal(schema.def.valueType, cache);
    return rebuildZodMcpSchema(schema, {
      keyType: keyType,
      valueType: valueType
    });
  }
  if (schema instanceof ZodUnion) {
    let newOptions = schema.def.options.map((opt: any) =>
      zodStripMcpSchemaIdInternal(opt, cache)
    );
    return rebuildZodMcpSchema(schema, { options: newOptions });
  }
  if (schema instanceof ZodIntersection) {
    let left = zodStripMcpSchemaIdInternal(schema.def.left, cache);
    let right = zodStripMcpSchemaIdInternal(schema.def.right, cache);
    return rebuildZodMcpSchema(schema, { left: left, right: right });
  }
  if (schema instanceof ZodTuple) {
    let items = schema.def.items.map((item: any) =>
      zodStripMcpSchemaIdInternal(item, cache)
    );
    let rest = schema.def.rest
      ? zodStripMcpSchemaIdInternal(schema.def.rest, cache)
      : schema.def.rest;
    return rebuildZodMcpSchema(schema, { items: items, rest: rest });
  }
  if (schema instanceof ZodLazy) {
    let originalGetter = schema.def.getter;
    return rebuildZodMcpSchema(schema, {
      getter: () => zodStripMcpSchemaIdInternal(originalGetter(), cache)
    });
  }
  if (schema instanceof ZodPipe) {
    let in_ = zodStripMcpSchemaIdInternal(schema.def.in, cache);
    let out = zodStripMcpSchemaIdInternal(schema.def.out, cache);
    return rebuildZodMcpSchema(schema, { in: in_, out: out });
  }
  return rebuildZodMcpSchema(schema, {});
}
