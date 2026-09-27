import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateSessionSseTicketError,
  zToBackendCreateSessionSseTicketError
} from './create-session-sse-ticket-error';

export type ToBackendCreateSessionSseTicketOutput = {
  sseTicket: string;
};

export type ToBackendCreateSessionSseTicketResponse = ToBackendResponse<
  ToBackendCreateSessionSseTicketOutput,
  ToBackendCreateSessionSseTicketError
>;

export let zToBackendCreateSessionSseTicketOutput = z
  .object({
    sseTicket: z.string()
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketOutput' });

export let zToBackendCreateSessionSseTicketResponse =
  makeToBackendResponseSchema({
    success: zToBackendCreateSessionSseTicketOutput,
    error: zToBackendCreateSessionSseTicketError
  }).meta({ id: 'ToBackendCreateSessionSseTicketResponse' });

assertTypesEqual<
  ToBackendCreateSessionSseTicketOutput,
  z.infer<typeof zToBackendCreateSessionSseTicketOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateSessionSseTicketResponse,
  z.infer<typeof zToBackendCreateSessionSseTicketResponse>
>({ value: true });
