import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendPollUserCodexAuthInput = {
  deviceAuthId: string;
  userCode: string;
};

export type ToBackendPollUserCodexAuthRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendPollUserCodexAuthInput;
};

export let zToBackendPollUserCodexAuthInput = z
  .object({
    deviceAuthId: z.string(),
    userCode: z.string()
  })
  .meta({ id: 'ToBackendPollUserCodexAuthInput' });

export let zToBackendPollUserCodexAuthRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendPollUserCodexAuthInput
  })
  .meta({ id: 'ToBackendPollUserCodexAuthRequest' });

assertTypesEqual<
  ToBackendPollUserCodexAuthInput,
  z.infer<typeof zToBackendPollUserCodexAuthInput>
>({ value: true });

assertTypesEqual<
  ToBackendPollUserCodexAuthRequest,
  z.infer<typeof zToBackendPollUserCodexAuthRequest>
>({ value: true });
