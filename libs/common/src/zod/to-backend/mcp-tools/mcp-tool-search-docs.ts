import { z } from 'zod';

export let zMcpToolSearchDocsInput = z
  .object({
    query: z
      .string()
      .min(1)
      .describe(
        'Search query. Whitespace-separated terms are AND-matched (case-insensitive) against documentation file contents.'
      )
  })
  .meta({ id: 'McpToolSearchDocsInput' });

export let zMcpToolSearchDocsOutput = z
  .union([
    z.object({
      ok: z.literal(true),
      searchDocsResults: z.array(
        z.object({
          pageId: z.string(),
          snippets: z.array(z.string())
        })
      )
    }),
    z.object({
      ok: z.literal(false),
      error: z.string()
    })
  ])
  .meta({ id: 'McpToolSearchDocsOutput' });

export type McpToolSearchDocsInput = z.infer<typeof zMcpToolSearchDocsInput>;

export type McpToolSearchDocsOutput = z.infer<typeof zMcpToolSearchDocsOutput>;
