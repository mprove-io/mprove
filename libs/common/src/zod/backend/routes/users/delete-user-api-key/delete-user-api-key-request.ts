import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteUserApiKeyInput = Record<string, never>;

export type ToBackendDeleteUserApiKeyRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteUserApiKeyInput;
};

export let zToBackendDeleteUserApiKeyInput = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserApiKeyInput' });

export let zToBackendDeleteUserApiKeyRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteUserApiKeyInput
  })
  .meta({ id: 'ToBackendDeleteUserApiKeyRequest' });

assertTypesEqual<
  ToBackendDeleteUserApiKeyInput,
  z.infer<typeof zToBackendDeleteUserApiKeyInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteUserApiKeyRequest,
  z.infer<typeof zToBackendDeleteUserApiKeyRequest>
>({ value: true });
