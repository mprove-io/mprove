import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zSessionApi } from '#common/zod/backend/session-api';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendPauseEditorSessionRequestPayload = z
  .object({
    sessionId: z.string()
  })
  .meta({ id: 'ToBackendPauseEditorSessionRequestPayload' });

export let zToBackendPauseEditorSessionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendPauseEditorSession)
  })
  .meta({ id: 'ToBackendPauseEditorSessionRequestInfo' });

export let zToBackendPauseEditorSessionRequest = zToBackendRequest
  .extend({
    info: zToBackendPauseEditorSessionRequestInfo,
    payload: zToBackendPauseEditorSessionRequestPayload
  })
  .meta({ id: 'ToBackendPauseEditorSessionRequest' });

export let zToBackendPauseEditorSessionResponsePayload = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendPauseEditorSessionResponsePayload' });

export let zToBackendPauseEditorSessionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendPauseEditorSession}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendPauseEditorSessionResponseInfo' });

export let zToBackendPauseEditorSessionResponse = zMyResponse
  .extend({
    info: zToBackendPauseEditorSessionResponseInfo,
    payload: zToBackendPauseEditorSessionResponsePayload
  })
  .meta({ id: 'ToBackendPauseEditorSessionResponse' });

export type ToBackendPauseEditorSessionRequestPayload = z.infer<
  typeof zToBackendPauseEditorSessionRequestPayload
>;
export type ToBackendPauseEditorSessionRequest = z.infer<
  typeof zToBackendPauseEditorSessionRequest
>;
export type ToBackendPauseEditorSessionResponsePayload = z.infer<
  typeof zToBackendPauseEditorSessionResponsePayload
>;
export type ToBackendPauseEditorSessionResponse = z.infer<
  typeof zToBackendPauseEditorSessionResponse
>;
