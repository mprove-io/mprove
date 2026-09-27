import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteUserCodexAuthInput = Record<string, never>;

export type ToBackendDeleteUserCodexAuthRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteUserCodexAuthInput;
};

export let zToBackendDeleteUserCodexAuthInput = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserCodexAuthInput' });

export let zToBackendDeleteUserCodexAuthRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteUserCodexAuthInput
  })
  .meta({ id: 'ToBackendDeleteUserCodexAuthRequest' });

assertTypesEqual<
  ToBackendDeleteUserCodexAuthInput,
  z.infer<typeof zToBackendDeleteUserCodexAuthInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteUserCodexAuthRequest,
  z.infer<typeof zToBackendDeleteUserCodexAuthRequest>
>({ value: true });
