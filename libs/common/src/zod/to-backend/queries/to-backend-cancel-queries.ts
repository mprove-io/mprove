import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCancelQueriesRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendCancelQueriesRequestPayload' });

export let zToBackendCancelQueriesRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCancelQueries)
  })
  .meta({ id: 'ToBackendCancelQueriesRequestInfo' });

export let zToBackendCancelQueriesRequest = zToBackendRequest
  .extend({
    info: zToBackendCancelQueriesRequestInfo,
    payload: zToBackendCancelQueriesRequestPayload
  })
  .meta({ id: 'ToBackendCancelQueriesRequest' });

export let zToBackendCancelQueriesResponsePayload = z
  .object({
    queries: z.array(zQuery)
  })
  .meta({ id: 'ToBackendCancelQueriesResponsePayload' });

export let zToBackendCancelQueriesResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCancelQueries}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCancelQueriesResponseInfo' });

export let zToBackendCancelQueriesResponse = zMyResponse
  .extend({
    info: zToBackendCancelQueriesResponseInfo,
    payload: zToBackendCancelQueriesResponsePayload
  })
  .meta({ id: 'ToBackendCancelQueriesResponse' });

export type ToBackendCancelQueriesRequestPayload = z.infer<
  typeof zToBackendCancelQueriesRequestPayload
>;
export type ToBackendCancelQueriesRequest = z.infer<
  typeof zToBackendCancelQueriesRequest
>;
export type ToBackendCancelQueriesResponsePayload = z.infer<
  typeof zToBackendCancelQueriesResponsePayload
>;
export type ToBackendCancelQueriesResponse = z.infer<
  typeof zToBackendCancelQueriesResponse
>;
