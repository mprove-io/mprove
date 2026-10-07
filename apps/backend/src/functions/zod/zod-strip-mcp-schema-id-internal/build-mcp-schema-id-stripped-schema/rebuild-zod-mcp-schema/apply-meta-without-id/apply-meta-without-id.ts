import type { z } from 'zod';
import { getZodMcpSchemaMeta } from '#backend/functions/zod/zod-strip-mcp-schema-id-internal/build-mcp-schema-id-stripped-schema/rebuild-zod-mcp-schema/apply-meta-without-id/get-zod-mcp-schema-meta/get-zod-mcp-schema-meta';
export function applyMetaWithoutId<T extends z.ZodType>(
  result: T,
  src: unknown
): T {
  let meta = getZodMcpSchemaMeta(src);
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
