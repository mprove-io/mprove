import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendArchiveSessionRequest = {
  operation: 'archiveSession';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
  };
};

export let zToBackendArchiveSessionRequest = z
  .strictObject({
    operation: z.literal('archiveSession'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string()
      })
      .meta({ id: 'ToBackendArchiveSessionInput' })
  })
  .meta({ id: 'ToBackendArchiveSessionRequest' });

assertTypesEqual<
  ToBackendArchiveSessionRequest,
  z.infer<typeof zToBackendArchiveSessionRequest>
>({ value: true });
