import { z } from 'zod';
import { buildMcpSchemaIdStrippedSchema } from '#backend/functions/zod/zod-strip-mcp-schema-id-internal/build-mcp-schema-id-stripped-schema/build-mcp-schema-id-stripped-schema';
export function zodStripMcpSchemaIdInternal<T extends z.core.SomeType>(
  schema: T,
  cache: WeakMap<object, any>
): any {
  let cached = cache.get(schema);
  if (cached !== undefined) {
    return cached;
  }
  let resultRef: {
    current: any;
  } = { current: undefined };
  cache.set(
    schema,
    z.lazy(() => resultRef.current)
  );
  let result = buildMcpSchemaIdStrippedSchema(schema, cache);
  resultRef.current = result;
  cache.set(schema, result);
  return result;
}
