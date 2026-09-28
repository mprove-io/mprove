import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendPollUserCodexAuthRequest = {
  operation: 'pollUserCodexAuth';
  traceId: string;
  idempotencyKey: string;
  input: {
    deviceAuthId: string;
    userCode: string;
  };
};

export let zToBackendPollUserCodexAuthRequest = z
  .strictObject({
    operation: z.literal('pollUserCodexAuth'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        deviceAuthId: z.string(),
        userCode: z.string()
      })
      .meta({ id: 'ToBackendPollUserCodexAuthInput' })
  })
  .meta({ id: 'ToBackendPollUserCodexAuthRequest' });

assertTypesEqual<
  ToBackendPollUserCodexAuthRequest,
  z.infer<typeof zToBackendPollUserCodexAuthRequest>
>({ value: true });
