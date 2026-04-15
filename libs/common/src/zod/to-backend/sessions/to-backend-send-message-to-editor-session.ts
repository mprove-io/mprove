import { z } from 'zod';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zSessionApi } from '#common/zod/backend/session-api';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSendMessageToEditorSessionRequestPayload = z
  .object({
    sessionId: z.string(),
    messageId: z.string().nullish(),
    partId: z.string().nullish(),
    interactionType: z.enum(InteractionTypeEnum),
    message: z.string().nullish(),
    model: z.string().nullish(),
    variant: z.string().nullish(),
    agent: z.string().nullish(),
    permissionId: z.string().nullish(),
    reply: z.string().nullish(),
    questionId: z.string().nullish(),
    answers: z.array(z.array(z.string())).nullish()
  })
  .meta({ id: 'ToBackendSendMessageToEditorSessionRequestPayload' });

export let zToBackendSendMessageToEditorSessionRequestInfo =
  zToBackendRequestInfo
    .extend({
      name: z.literal(
        ToBackendRequestInfoNameEnum.ToBackendSendMessageToEditorSession
      )
    })
    .meta({ id: 'ToBackendSendMessageToEditorSessionRequestInfo' });

export let zToBackendSendMessageToEditorSessionRequest = zToBackendRequest
  .extend({
    info: zToBackendSendMessageToEditorSessionRequestInfo,
    payload: zToBackendSendMessageToEditorSessionRequestPayload
  })
  .meta({ id: 'ToBackendSendMessageToEditorSessionRequest' });

export let zToBackendSendMessageToEditorSessionResponsePayload = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendSendMessageToEditorSessionResponsePayload' });

export let zToBackendSendMessageToEditorSessionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSendMessageToEditorSession}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSendMessageToEditorSessionResponseInfo' });

export let zToBackendSendMessageToEditorSessionResponse = zMyResponse
  .extend({
    info: zToBackendSendMessageToEditorSessionResponseInfo,
    payload: zToBackendSendMessageToEditorSessionResponsePayload
  })
  .meta({ id: 'ToBackendSendMessageToEditorSessionResponse' });

export type ToBackendSendMessageToEditorSessionRequestPayload = z.infer<
  typeof zToBackendSendMessageToEditorSessionRequestPayload
>;
export type ToBackendSendMessageToEditorSessionRequest = z.infer<
  typeof zToBackendSendMessageToEditorSessionRequest
>;
export type ToBackendSendMessageToEditorSessionResponsePayload = z.infer<
  typeof zToBackendSendMessageToEditorSessionResponsePayload
>;
export type ToBackendSendMessageToEditorSessionResponse = z.infer<
  typeof zToBackendSendMessageToEditorSessionResponse
>;
