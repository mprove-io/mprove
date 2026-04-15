import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateSessionSseTicketRequestPayload = z
  .object({
    sessionId: z.string()
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketRequestPayload' });

export let zToBackendCreateSessionSseTicketRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendCreateSessionSseTicket
    )
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketRequestInfo' });

export let zToBackendCreateSessionSseTicketRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateSessionSseTicketRequestInfo,
    payload: zToBackendCreateSessionSseTicketRequestPayload
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketRequest' });

export let zToBackendCreateSessionSseTicketResponsePayload = z
  .object({
    sseTicket: z.string()
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketResponsePayload' });

export let zToBackendCreateSessionSseTicketResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendCreateSessionSseTicket}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketResponseInfo' });

export let zToBackendCreateSessionSseTicketResponse = zMyResponse
  .extend({
    info: zToBackendCreateSessionSseTicketResponseInfo,
    payload: zToBackendCreateSessionSseTicketResponsePayload
  })
  .meta({ id: 'ToBackendCreateSessionSseTicketResponse' });

export type ToBackendCreateSessionSseTicketRequestPayload = z.infer<
  typeof zToBackendCreateSessionSseTicketRequestPayload
>;
export type ToBackendCreateSessionSseTicketRequest = z.infer<
  typeof zToBackendCreateSessionSseTicketRequest
>;
export type ToBackendCreateSessionSseTicketResponsePayload = z.infer<
  typeof zToBackendCreateSessionSseTicketResponsePayload
>;
export type ToBackendCreateSessionSseTicketResponse = z.infer<
  typeof zToBackendCreateSessionSseTicketResponse
>;
