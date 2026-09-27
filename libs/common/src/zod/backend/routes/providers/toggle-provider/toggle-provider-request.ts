import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendToggleProviderInput = {
  projectId: string;
  providerId: string;
  isEnabled: boolean;
};

export type ToBackendToggleProviderRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendToggleProviderInput;
};

export let zToBackendToggleProviderInput = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    isEnabled: z.boolean()
  })
  .meta({ id: 'ToBackendToggleProviderInput' });

export let zToBackendToggleProviderRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendToggleProviderInput
  })
  .meta({ id: 'ToBackendToggleProviderRequest' });

assertTypesEqual<
  ToBackendToggleProviderInput,
  z.infer<typeof zToBackendToggleProviderInput>
>({ value: true });

assertTypesEqual<
  ToBackendToggleProviderRequest,
  z.infer<typeof zToBackendToggleProviderRequest>
>({ value: true });
