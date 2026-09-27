import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteProviderInput = {
  projectId: string;
  providerId: string;
};

export type ToBackendDeleteProviderRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteProviderInput;
};

export let zToBackendDeleteProviderInput = z
  .object({
    projectId: z.string(),
    providerId: z.string()
  })
  .meta({ id: 'ToBackendDeleteProviderInput' });

export let zToBackendDeleteProviderRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteProviderInput
  })
  .meta({ id: 'ToBackendDeleteProviderRequest' });

assertTypesEqual<
  ToBackendDeleteProviderInput,
  z.infer<typeof zToBackendDeleteProviderInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteProviderRequest,
  z.infer<typeof zToBackendDeleteProviderRequest>
>({ value: true });
