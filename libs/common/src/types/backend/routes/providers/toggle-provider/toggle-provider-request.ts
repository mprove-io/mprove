import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendToggleProviderRequest = {
  operation: 'toggleProvider';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    providerId: string;
    isEnabled: boolean;
  };
};

export let zToBackendToggleProviderRequest = z
  .strictObject({
    operation: z.literal('toggleProvider'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        providerId: z.string(),
        isEnabled: z.boolean()
      })
      .meta({ id: 'ToBackendToggleProviderInput' })
  })
  .meta({ id: 'ToBackendToggleProviderRequest' });

assertTypesEqual<
  ToBackendToggleProviderRequest,
  z.infer<typeof zToBackendToggleProviderRequest>
>({ value: true });
