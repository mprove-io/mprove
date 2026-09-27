import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolSearchDocsInput = {
  query: string;
};

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

assertTypesEqual<
  McpToolSearchDocsInput,
  z.infer<typeof zMcpToolSearchDocsInput>
>({ value: true });

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
