import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionItem,
  zConnectionItem
} from '#common/zod/backend/connections/connection-item';

export type ToBackendGetConnectionsListOutput = {
  connectionItems: ConnectionItem[];
};

export let zToBackendGetConnectionsListOutput = z
  .object({
    connectionItems: z.array(zConnectionItem)
  })
  .meta({ id: 'ToBackendGetConnectionsListOutput' });

assertTypesEqual<
  ToBackendGetConnectionsListOutput,
  z.infer<typeof zToBackendGetConnectionsListOutput>
>({ value: true });
