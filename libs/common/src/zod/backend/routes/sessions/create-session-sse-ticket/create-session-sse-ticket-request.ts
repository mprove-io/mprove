import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateSessionSseTicketInput = {
  sessionId: string;
};

export type ToBackendCreateSessionSseTicketRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateSessionSseTicketInput;
};

export let zToBackendCreateSessionSseTicketInput = z
  .object({
    sessionId: z.string()
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketInput' });

export let zToBackendCreateSessionSseTicketRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateSessionSseTicketInput
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketRequest' });

assertTypesEqual<
  ToBackendCreateSessionSseTicketInput,
  z.infer<typeof zToBackendCreateSessionSseTicketInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateSessionSseTicketRequest,
  z.infer<typeof zToBackendCreateSessionSseTicketRequest>
>({ value: true });
