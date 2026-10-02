import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetSessionRequest = {
  operation: 'getSession';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
    isFetchFromOpencode: boolean;
  };
};

export let zToBackendGetSessionRequest = z
  .strictObject({
    operation: z.literal('getSession'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string(),
        isFetchFromOpencode: z.boolean()
      })
      .meta({ id: 'ToBackendGetSessionInput' })
  })
  .meta({ id: 'ToBackendGetSessionRequest' });

assertTypesEqual<
  ToBackendGetSessionRequest,
  z.infer<typeof zToBackendGetSessionRequest>
>({ value: true });
