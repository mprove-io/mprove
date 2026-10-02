import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetConnectionsListRequest = {
  operation: 'getConnectionsList';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
  };
};

export let zToBackendGetConnectionsListRequest = z
  .strictObject({
    operation: z.literal('getConnectionsList'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendGetConnectionsListInput' })
  })
  .meta({ id: 'ToBackendGetConnectionsListRequest' });

assertTypesEqual<
  ToBackendGetConnectionsListRequest,
  z.infer<typeof zToBackendGetConnectionsListRequest>
>({ value: true });
