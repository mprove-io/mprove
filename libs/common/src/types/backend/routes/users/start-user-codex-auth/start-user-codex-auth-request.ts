import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendStartUserCodexAuthRequest = {
  operation: 'startUserCodexAuth';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendStartUserCodexAuthRequest = z
  .strictObject({
    operation: z.literal('startUserCodexAuth'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendStartUserCodexAuthInput' })
  })
  .meta({ id: 'ToBackendStartUserCodexAuthRequest' });

assertTypesEqual<
  ToBackendStartUserCodexAuthRequest,
  z.infer<typeof zToBackendStartUserCodexAuthRequest>
>({ value: true });
