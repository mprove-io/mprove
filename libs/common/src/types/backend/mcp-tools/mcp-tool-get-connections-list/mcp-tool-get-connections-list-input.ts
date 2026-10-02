import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolGetConnectionsListInput = {
  projectId: string;
  envId: string;
};

export let zMcpToolGetConnectionsListInput = z
  .object({
    projectId: z.string().describe('Project ID'),
    envId: z.string().describe('Environment ID')
  })
  .meta({ id: 'McpToolGetConnectionsListInput' });

assertTypesEqual<
  McpToolGetConnectionsListInput,
  z.infer<typeof zMcpToolGetConnectionsListInput>
>({ value: true });
