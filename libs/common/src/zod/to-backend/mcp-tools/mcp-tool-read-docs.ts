import { z } from 'zod';

export let zMcpToolReadDocsInput = z
  .object({
    filePaths: z
      .array(z.string())
      .min(1)
      .describe(
        'One or more MDX file paths. Use list-docs to see available files.'
      )
  })
  .meta({ id: 'McpToolReadDocsInput' });

export let zMcpToolReadDocsOutput = z
  .union([
    z.object({
      ok: z.literal(true),
      readDocsResults: z.array(
        z.object({
          filePath: z.string(),
          content: z.string()
        })
      )
    }),
    z.object({
      ok: z.literal(false),
      error: z.string()
    })
  ])
  .meta({ id: 'McpToolReadDocsOutput' });

export type McpToolReadDocsInput = z.infer<typeof zMcpToolReadDocsInput>;

export type McpToolReadDocsOutput = z.infer<typeof zMcpToolReadDocsOutput>;
