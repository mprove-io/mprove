import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionItem,
  zConnectionItem
} from '#common/types/backend/parts/connections/connection-item';

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

export type McpToolGetConnectionsListOutput = {
  connectionItems: ConnectionItem[];
};

export let zMcpToolGetConnectionsListOutput = z
  .object({
    connectionItems: z.array(zConnectionItem)
  })
  .meta({ id: 'McpToolGetConnectionsListOutput' });

assertTypesEqual<
  McpToolGetConnectionsListOutput,
  z.infer<typeof zMcpToolGetConnectionsListOutput>
>({ value: true });
