import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolReadDocsOutput =
  | {
      ok: true;
      readDocsResults: {
        pageId: string;
        content: string;
      }[];
    }
  | {
      ok: false;
      error: string;
    };

export let zMcpToolReadDocsOutput = z
  .union([
    z.object({
      ok: z.literal(true),
      readDocsResults: z.array(
        z.object({
          pageId: z.string(),
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

assertTypesEqual<McpToolReadDocsOutput, z.infer<typeof zMcpToolReadDocsOutput>>(
  { value: true }
);
