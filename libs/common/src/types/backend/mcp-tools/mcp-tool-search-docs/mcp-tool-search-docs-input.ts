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
