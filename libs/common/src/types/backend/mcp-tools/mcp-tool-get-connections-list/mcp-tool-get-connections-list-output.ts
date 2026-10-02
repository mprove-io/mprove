import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionItem,
  zConnectionItem
} from '#common/types/backend/parts/connections/connection-item';

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
