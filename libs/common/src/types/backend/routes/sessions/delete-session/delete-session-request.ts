import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteSessionRequest = {
  operation: 'deleteSession';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
  };
};

export let zToBackendDeleteSessionRequest = z
  .strictObject({
    operation: z.literal('deleteSession'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string()
      })
      .meta({ id: 'ToBackendDeleteSessionInput' })
  })
  .meta({ id: 'ToBackendDeleteSessionRequest' });

assertTypesEqual<
  ToBackendDeleteSessionRequest,
  z.infer<typeof zToBackendDeleteSessionRequest>
>({ value: true });
