import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolReadDocsInput = {
  pageIds: string[];
};

export let zMcpToolReadDocsInput = z
  .object({
    pageIds: z
      .array(z.string())
      .min(1)
      .describe(
        'One or more documentation page ids. Use list-docs to see available ids.'
      )
  })
  .meta({ id: 'McpToolReadDocsInput' });

assertTypesEqual<McpToolReadDocsInput, z.infer<typeof zMcpToolReadDocsInput>>({
  value: true
});
