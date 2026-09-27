import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGenerateUserApiKeyInput = Record<string, never>;

export type ToBackendGenerateUserApiKeyRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGenerateUserApiKeyInput;
};

export let zToBackendGenerateUserApiKeyInput = z
  .object({})
  .meta({ id: 'ToBackendGenerateUserApiKeyInput' });

export let zToBackendGenerateUserApiKeyRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGenerateUserApiKeyInput
  })
  .meta({ id: 'ToBackendGenerateUserApiKeyRequest' });

assertTypesEqual<
  ToBackendGenerateUserApiKeyInput,
  z.infer<typeof zToBackendGenerateUserApiKeyInput>
>({ value: true });

assertTypesEqual<
  ToBackendGenerateUserApiKeyRequest,
  z.infer<typeof zToBackendGenerateUserApiKeyRequest>
>({ value: true });
