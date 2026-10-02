import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetConnectionsRequest = {
  operation: 'getConnections';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId?: string;
  };
};

export let zToBackendGetConnectionsRequest = z
  .strictObject({
    operation: z.literal('getConnections'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string().nullish()
      })
      .meta({ id: 'ToBackendGetConnectionsInput' })
  })
  .meta({ id: 'ToBackendGetConnectionsRequest' });

assertTypesEqual<
  ToBackendGetConnectionsRequest,
  z.infer<typeof zToBackendGetConnectionsRequest>
>({ value: true });
