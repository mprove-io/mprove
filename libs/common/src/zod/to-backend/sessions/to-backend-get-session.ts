import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zOcSessionApi } from '#common/zod/backend/oc-session-api';
import { zSessionApi } from '#common/zod/backend/session-api';
import { zSessionEventApi } from '#common/zod/backend/session-event-api';
import { zSessionMessageApi } from '#common/zod/backend/session-message-api';
import { zSessionPartApi } from '#common/zod/backend/session-part-api';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetSessionRequestPayload = z
  .object({
    sessionId: z.string(),
    isFetchFromOpencode: z.boolean()
  })
  .meta({ id: 'ToBackendGetSessionRequestPayload' });

export let zToBackendGetSessionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetSession)
  })
  .meta({ id: 'ToBackendGetSessionRequestInfo' });

export let zToBackendGetSessionRequest = zToBackendRequest
  .extend({
    info: zToBackendGetSessionRequestInfo,
    payload: zToBackendGetSessionRequestPayload
  })
  .meta({ id: 'ToBackendGetSessionRequest' });

export let zToBackendGetSessionResponsePayload = z
  .object({
    session: zSessionApi,
    ocSession: zOcSessionApi,
    lastEventIndex: z.number(),
    messages: z.array(zSessionMessageApi),
    parts: z.array(zSessionPartApi),
    events: z.array(zSessionEventApi),
    sessions: z.array(zSessionApi),
    hasMoreArchived: z.boolean()
  })
  .meta({ id: 'ToBackendGetSessionResponsePayload' });

export let zToBackendGetSessionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetSession}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetSessionResponseInfo' });

export let zToBackendGetSessionResponse = zMyResponse
  .extend({
    info: zToBackendGetSessionResponseInfo,
    payload: zToBackendGetSessionResponsePayload
  })
  .meta({ id: 'ToBackendGetSessionResponse' });

export type ToBackendGetSessionRequestPayload = z.infer<
  typeof zToBackendGetSessionRequestPayload
>;
export type ToBackendGetSessionRequest = z.infer<
  typeof zToBackendGetSessionRequest
>;
export type ToBackendGetSessionResponsePayload = z.infer<
  typeof zToBackendGetSessionResponsePayload
>;
export type ToBackendGetSessionResponse = z.infer<
  typeof zToBackendGetSessionResponse
>;
