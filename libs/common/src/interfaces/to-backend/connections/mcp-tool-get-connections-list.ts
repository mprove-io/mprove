import { z } from 'zod';
import { zConnectionItem } from '#common/zod/to-backend/connections/connection-item';

export let zMcpToolGetConnectionsListInput = z
  .object({
    projectId: z.string().describe('Project ID'),
    envId: z.string().describe('Environment ID')
  })
  .meta({ id: 'McpToolGetConnectionsListInput' });

export let zMcpToolGetConnectionsListOutput = z
  .object({
    connectionItems: z.array(zConnectionItem)
  })
  .meta({ id: 'McpToolGetConnectionsListOutput' });

export type McpToolGetConnectionsListInput = z.infer<
  typeof zMcpToolGetConnectionsListInput
>;

export type McpToolGetConnectionsListOutput = z.infer<
  typeof zMcpToolGetConnectionsListOutput
>;
