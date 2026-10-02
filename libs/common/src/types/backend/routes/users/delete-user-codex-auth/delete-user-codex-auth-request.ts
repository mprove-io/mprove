import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteUserCodexAuthRequest = {
  operation: 'deleteUserCodexAuth';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendDeleteUserCodexAuthRequest = z
  .strictObject({
    operation: z.literal('deleteUserCodexAuth'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendDeleteUserCodexAuthInput' })
  })
  .meta({ id: 'ToBackendDeleteUserCodexAuthRequest' });

assertTypesEqual<
  ToBackendDeleteUserCodexAuthRequest,
  z.infer<typeof zToBackendDeleteUserCodexAuthRequest>
>({ value: true });
