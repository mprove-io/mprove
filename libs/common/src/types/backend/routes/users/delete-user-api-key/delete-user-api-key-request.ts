import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteUserApiKeyRequest = {
  operation: 'deleteUserApiKey';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendDeleteUserApiKeyRequest = z
  .strictObject({
    operation: z.literal('deleteUserApiKey'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendDeleteUserApiKeyInput' })
  })
  .meta({ id: 'ToBackendDeleteUserApiKeyRequest' });

assertTypesEqual<
  ToBackendDeleteUserApiKeyRequest,
  z.infer<typeof zToBackendDeleteUserApiKeyRequest>
>({ value: true });
