import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolSearchDocsOutput =
  | {
      ok: true;
      searchDocsResults: {
        pageId: string;
        snippets: string[];
      }[];
    }
  | {
      ok: false;
      error: string;
    };

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

assertTypesEqual<
  McpToolSearchDocsOutput,
  z.infer<typeof zMcpToolSearchDocsOutput>
>({ value: true });
