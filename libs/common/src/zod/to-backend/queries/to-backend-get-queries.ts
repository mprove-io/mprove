import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetQueriesRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigIds: z.array(z.string()).min(1),
    skipData: z.boolean()
  })
  .meta({ id: 'ToBackendGetQueriesRequestPayload' });

export let zToBackendGetQueriesRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetQueries)
  })
  .meta({ id: 'ToBackendGetQueriesRequestInfo' });

export let zToBackendGetQueriesRequest = zToBackendRequest
  .extend({
    info: zToBackendGetQueriesRequestInfo,
    payload: zToBackendGetQueriesRequestPayload
  })
  .meta({ id: 'ToBackendGetQueriesRequest' });

export let zToBackendGetQueriesResponsePayload = z
  .object({
    queries: z.array(zQuery)
  })
  .meta({ id: 'ToBackendGetQueriesResponsePayload' });

export let zToBackendGetQueriesResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetQueries}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetQueriesResponseInfo' });

export let zToBackendGetQueriesResponse = zMyResponse
  .extend({
    info: zToBackendGetQueriesResponseInfo,
    payload: zToBackendGetQueriesResponsePayload
  })
  .meta({ id: 'ToBackendGetQueriesResponse' });

export type ToBackendGetQueriesRequestPayload = z.infer<
  typeof zToBackendGetQueriesRequestPayload
>;
export type ToBackendGetQueriesRequest = z.infer<
  typeof zToBackendGetQueriesRequest
>;
export type ToBackendGetQueriesResponsePayload = z.infer<
  typeof zToBackendGetQueriesResponsePayload
>;
export type ToBackendGetQueriesResponse = z.infer<
  typeof zToBackendGetQueriesResponse
>;
