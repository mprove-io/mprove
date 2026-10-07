import { z } from 'zod';
import { zodStripMcpSchemaIdInternal } from '#backend/functions/zod/zod-strip-mcp-schema-id-internal/zod-strip-mcp-schema-id-internal';
export function zodStripMcpSchemaId<T extends z.core.SomeType>(item: {
  schema: T;
}): T {
  let { schema } = item;
  let cache: WeakMap<object, any> = new WeakMap();
  return zodStripMcpSchemaIdInternal(schema, cache);
}
