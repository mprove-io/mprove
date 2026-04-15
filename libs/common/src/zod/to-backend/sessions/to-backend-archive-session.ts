import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zSessionApi } from '#common/zod/backend/session-api';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendArchiveSessionRequestPayload = z
  .object({
    sessionId: z.string()
  })
  .meta({ id: 'ToBackendArchiveSessionRequestPayload' });

export let zToBackendArchiveSessionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendArchiveSession)
  })
  .meta({ id: 'ToBackendArchiveSessionRequestInfo' });

export let zToBackendArchiveSessionRequest = zToBackendRequest
  .extend({
    info: zToBackendArchiveSessionRequestInfo,
    payload: zToBackendArchiveSessionRequestPayload
  })
  .meta({ id: 'ToBackendArchiveSessionRequest' });

export let zToBackendArchiveSessionResponsePayload = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendArchiveSessionResponsePayload' });

export let zToBackendArchiveSessionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendArchiveSession}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendArchiveSessionResponseInfo' });

export let zToBackendArchiveSessionResponse = zMyResponse
  .extend({
    info: zToBackendArchiveSessionResponseInfo,
    payload: zToBackendArchiveSessionResponsePayload
  })
  .meta({ id: 'ToBackendArchiveSessionResponse' });

export type ToBackendArchiveSessionRequestPayload = z.infer<
  typeof zToBackendArchiveSessionRequestPayload
>;
export type ToBackendArchiveSessionRequest = z.infer<
  typeof zToBackendArchiveSessionRequest
>;
export type ToBackendArchiveSessionResponsePayload = z.infer<
  typeof zToBackendArchiveSessionResponsePayload
>;
export type ToBackendArchiveSessionResponse = z.infer<
  typeof zToBackendArchiveSessionResponse
>;
