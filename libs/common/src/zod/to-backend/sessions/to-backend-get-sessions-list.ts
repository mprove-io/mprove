import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zSessionApi } from '#common/zod/backend/session-api';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetSessionsListRequestPayload = z
  .object({
    projectId: z.string(),
    currentSessionId: z.string().nullish(),
    includeArchived: z.boolean().nullish(),
    archivedLimit: z.number().nullish(),
    archivedLastCreatedTs: z.number().nullish()
  })
  .meta({ id: 'ToBackendGetSessionsListRequestPayload' });

export let zToBackendGetSessionsListRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetSessionsList)
  })
  .meta({ id: 'ToBackendGetSessionsListRequestInfo' });

export let zToBackendGetSessionsListRequest = zToBackendRequest
  .extend({
    info: zToBackendGetSessionsListRequestInfo,
    payload: zToBackendGetSessionsListRequestPayload
  })
  .meta({ id: 'ToBackendGetSessionsListRequest' });

export let zToBackendGetSessionsListResponsePayload = z
  .object({
    sessions: z.array(zSessionApi),
    hasMoreArchived: z.boolean().nullish()
  })
  .meta({ id: 'ToBackendGetSessionsListResponsePayload' });

export let zToBackendGetSessionsListResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetSessionsList}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetSessionsListResponseInfo' });

export let zToBackendGetSessionsListResponse = zMyResponse
  .extend({
    info: zToBackendGetSessionsListResponseInfo,
    payload: zToBackendGetSessionsListResponsePayload
  })
  .meta({ id: 'ToBackendGetSessionsListResponse' });

export type ToBackendGetSessionsListRequestPayload = z.infer<
  typeof zToBackendGetSessionsListRequestPayload
>;
export type ToBackendGetSessionsListRequest = z.infer<
  typeof zToBackendGetSessionsListRequest
>;
export type ToBackendGetSessionsListResponsePayload = z.infer<
  typeof zToBackendGetSessionsListResponsePayload
>;
export type ToBackendGetSessionsListResponse = z.infer<
  typeof zToBackendGetSessionsListResponse
>;
