import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolListDocsInput = Record<string, never>;

export let zMcpToolListDocsInput = z
  .object({})
  .meta({ id: 'McpToolListDocsInput' });

assertTypesEqual<McpToolListDocsInput, z.infer<typeof zMcpToolListDocsInput>>({
  value: true
});
