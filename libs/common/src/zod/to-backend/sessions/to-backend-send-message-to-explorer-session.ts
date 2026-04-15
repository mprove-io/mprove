import { z } from 'zod';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zSessionApi } from '#common/zod/backend/session-api';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSendMessageToExplorerSessionRequestPayload = z
  .object({
    sessionId: z.string(),
    messageId: z.string().nullish(),
    partId: z.string().nullish(),
    interactionType: z.enum(InteractionTypeEnum),
    message: z.string().nullish(),
    model: z.string().nullish(),
    variant: z.string().nullish()
  })
  .meta({ id: 'ToBackendSendMessageToExplorerSessionRequestPayload' });

export let zToBackendSendMessageToExplorerSessionRequestInfo =
  zToBackendRequestInfo
    .extend({
      name: z.literal(
        ToBackendRequestInfoNameEnum.ToBackendSendMessageToExplorerSession
      )
    })
    .meta({ id: 'ToBackendSendMessageToExplorerSessionRequestInfo' });

export let zToBackendSendMessageToExplorerSessionRequest = zToBackendRequest
  .extend({
    info: zToBackendSendMessageToExplorerSessionRequestInfo,
    payload: zToBackendSendMessageToExplorerSessionRequestPayload
  })
  .meta({ id: 'ToBackendSendMessageToExplorerSessionRequest' });

export let zToBackendSendMessageToExplorerSessionResponsePayload = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendSendMessageToExplorerSessionResponsePayload' });

export let zToBackendSendMessageToExplorerSessionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSendMessageToExplorerSession}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSendMessageToExplorerSessionResponseInfo' });

export let zToBackendSendMessageToExplorerSessionResponse = zMyResponse
  .extend({
    info: zToBackendSendMessageToExplorerSessionResponseInfo,
    payload: zToBackendSendMessageToExplorerSessionResponsePayload
  })
  .meta({ id: 'ToBackendSendMessageToExplorerSessionResponse' });

export type ToBackendSendMessageToExplorerSessionRequestPayload = z.infer<
  typeof zToBackendSendMessageToExplorerSessionRequestPayload
>;
export type ToBackendSendMessageToExplorerSessionRequest = z.infer<
  typeof zToBackendSendMessageToExplorerSessionRequest
>;
export type ToBackendSendMessageToExplorerSessionResponsePayload = z.infer<
  typeof zToBackendSendMessageToExplorerSessionResponsePayload
>;
export type ToBackendSendMessageToExplorerSessionResponse = z.infer<
  typeof zToBackendSendMessageToExplorerSessionResponse
>;
