import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteProviderRequest = {
  operation: 'deleteProvider';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    providerId: string;
  };
};

export let zToBackendDeleteProviderRequest = z
  .strictObject({
    operation: z.literal('deleteProvider'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        providerId: z.string()
      })
      .meta({ id: 'ToBackendDeleteProviderInput' })
  })
  .meta({ id: 'ToBackendDeleteProviderRequest' });

assertTypesEqual<
  ToBackendDeleteProviderRequest,
  z.infer<typeof zToBackendDeleteProviderRequest>
>({ value: true });
