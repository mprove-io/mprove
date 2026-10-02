import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateSessionSseTicketRequest = {
  operation: 'createSessionSseTicket';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
  };
};

export let zToBackendCreateSessionSseTicketRequest = z
  .strictObject({
    operation: z.literal('createSessionSseTicket'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string()
      })
      .meta({ id: 'ToBackendCreateSessionSseTicketInput' })
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketRequest' });

assertTypesEqual<
  ToBackendCreateSessionSseTicketRequest,
  z.infer<typeof zToBackendCreateSessionSseTicketRequest>
>({ value: true });
