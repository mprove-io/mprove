import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolListDocsInput = Record<string, never>;

export let zMcpToolListDocsInput = z
  .object({})
  .meta({ id: 'McpToolListDocsInput' });

assertTypesEqual<McpToolListDocsInput, z.infer<typeof zMcpToolListDocsInput>>({
  value: true
});

export type McpToolListDocsOutput = {
  ok: true;
  pageIds: string[];
};

export let zMcpToolListDocsOutput = z
  .object({
    ok: z.literal(true),
    pageIds: z.array(z.string())
  })
  .meta({ id: 'McpToolListDocsOutput' });

assertTypesEqual<McpToolListDocsOutput, z.infer<typeof zMcpToolListDocsOutput>>(
  { value: true }
);
