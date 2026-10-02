import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateSessionSseTicketOutput = {
  sseTicket: string;
};

export let zToBackendCreateSessionSseTicketOutput = z
  .object({
    sseTicket: z.string()
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketOutput' });

assertTypesEqual<
  ToBackendCreateSessionSseTicketOutput,
  z.infer<typeof zToBackendCreateSessionSseTicketOutput>
>({ value: true });
