import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetSessionTitleRequest = {
  operation: 'setSessionTitle';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
    title: string;
  };
};

export let zToBackendSetSessionTitleRequest = z
  .strictObject({
    operation: z.literal('setSessionTitle'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string(),
        title: z.string()
      })
      .meta({ id: 'ToBackendSetSessionTitleInput' })
  })
  .meta({ id: 'ToBackendSetSessionTitleRequest' });

assertTypesEqual<
  ToBackendSetSessionTitleRequest,
  z.infer<typeof zToBackendSetSessionTitleRequest>
>({ value: true });
