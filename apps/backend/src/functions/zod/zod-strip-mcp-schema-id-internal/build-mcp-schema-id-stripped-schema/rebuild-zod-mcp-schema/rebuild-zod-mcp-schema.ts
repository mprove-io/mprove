import type { z } from 'zod';
import { applyMetaWithoutId } from '#backend/functions/zod/zod-strip-mcp-schema-id-internal/build-mcp-schema-id-stripped-schema/rebuild-zod-mcp-schema/apply-meta-without-id/apply-meta-without-id';
export function rebuildZodMcpSchema<T extends z.core.SomeType>(
  schema: T,
  overrides: Record<string, unknown>
): any {
  let anySchema = schema as any;
  let cloned = anySchema.clone({ ...anySchema.def, ...overrides });
  return applyMetaWithoutId(cloned, schema);
}
