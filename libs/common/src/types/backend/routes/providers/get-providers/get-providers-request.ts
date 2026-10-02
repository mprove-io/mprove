import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetProvidersRequest = {
  operation: 'getProviders';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
  };
};

export let zToBackendGetProvidersRequest = z
  .strictObject({
    operation: z.literal('getProviders'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({ projectId: z.string() })
      .meta({ id: 'ToBackendGetProvidersInput' })
  })
  .meta({ id: 'ToBackendGetProvidersRequest' });

assertTypesEqual<
  ToBackendGetProvidersRequest,
  z.infer<typeof zToBackendGetProvidersRequest>
>({ value: true });
