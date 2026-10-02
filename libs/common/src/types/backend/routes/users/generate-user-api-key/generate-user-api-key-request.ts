import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGenerateUserApiKeyRequest = {
  operation: 'generateUserApiKey';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendGenerateUserApiKeyRequest = z
  .strictObject({
    operation: z.literal('generateUserApiKey'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendGenerateUserApiKeyInput' })
  })
  .meta({ id: 'ToBackendGenerateUserApiKeyRequest' });

assertTypesEqual<
  ToBackendGenerateUserApiKeyRequest,
  z.infer<typeof zToBackendGenerateUserApiKeyRequest>
>({ value: true });
