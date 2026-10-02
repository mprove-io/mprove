import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateSessionSseTicketOutput,
  zToBackendCreateSessionSseTicketOutput
} from '#common/types/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-output';
import {
  type ToBackendCreateSessionSseTicketError,
  zToBackendCreateSessionSseTicketError
} from './create-session-sse-ticket-error';

export type ToBackendCreateSessionSseTicketResponse = ToBackendResponseBase<
  'createSessionSseTicket',
  ToBackendCreateSessionSseTicketOutput,
  ToBackendCreateSessionSseTicketError
>;

export let zToBackendCreateSessionSseTicketResponse =
  makeToBackendResponseSchema({
    operation: 'createSessionSseTicket',
    output: zToBackendCreateSessionSseTicketOutput,
    error: zToBackendCreateSessionSseTicketError
  }).meta({ id: 'ToBackendCreateSessionSseTicketResponse' });

assertTypesEqual<
  ToBackendCreateSessionSseTicketResponse,
  z.infer<typeof zToBackendCreateSessionSseTicketResponse>
>({ value: true });
