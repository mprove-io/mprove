import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteConnectionRequest = {
  operation: 'deleteConnection';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    connectionId: string;
  };
};

export let zToBackendDeleteConnectionRequest = z
  .strictObject({
    operation: z.literal('deleteConnection'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        connectionId: z.string()
      })
      .meta({ id: 'ToBackendDeleteConnectionInput' })
  })
  .meta({ id: 'ToBackendDeleteConnectionRequest' });

assertTypesEqual<
  ToBackendDeleteConnectionRequest,
  z.infer<typeof zToBackendDeleteConnectionRequest>
>({ value: true });
