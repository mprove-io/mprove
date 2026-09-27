import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendStartUserCodexAuthInput = Record<string, never>;

export type ToBackendStartUserCodexAuthRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendStartUserCodexAuthInput;
};

export let zToBackendStartUserCodexAuthInput = z
  .object({})
  .meta({ id: 'ToBackendStartUserCodexAuthInput' });

export let zToBackendStartUserCodexAuthRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendStartUserCodexAuthInput
  })
  .meta({ id: 'ToBackendStartUserCodexAuthRequest' });

assertTypesEqual<
  ToBackendStartUserCodexAuthInput,
  z.infer<typeof zToBackendStartUserCodexAuthInput>
>({ value: true });

assertTypesEqual<
  ToBackendStartUserCodexAuthRequest,
  z.infer<typeof zToBackendStartUserCodexAuthRequest>
>({ value: true });
