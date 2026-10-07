import { z } from 'zod';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';

export function makeMcpOutputSchema(item: {
  schema: z.ZodType;
}): Record<string, unknown> {
  let { schema } = item;

  let strippedSchema: z.ZodType = zodStripMcpSchemaId({
    schema: schema
  });

  let jsonSchema: Record<string, unknown> = z.toJSONSchema(strippedSchema, {
    io: 'output',
    target: 'draft-2020-12',
    unrepresentable: 'any'
  });

  // All Mprove tool responses are objects. Keep that root for legacy clients
  // while advertising unions through JSON Schema instead of MCP Nest's Zod path.
  let outputSchema: Record<string, unknown> = {
    ...jsonSchema,
    type: 'object'
  };

  return outputSchema;
}
