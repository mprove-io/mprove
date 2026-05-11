import { z } from 'zod';

export let zMcpToolListDocsInput = z
  .object({})
  .meta({ id: 'McpToolListDocsInput' });

export let zMcpToolListDocsOutput = z
  .object({
    ok: z.literal(true),
    pageIds: z.array(z.string())
  })
  .meta({ id: 'McpToolListDocsOutput' });

export type McpToolListDocsInput = z.infer<typeof zMcpToolListDocsInput>;

export type McpToolListDocsOutput = z.infer<typeof zMcpToolListDocsOutput>;
