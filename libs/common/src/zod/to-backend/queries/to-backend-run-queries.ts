import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendRunQueriesRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigIds: z.array(z.string()),
    poolSize: z.number().nullish()
  })
  .meta({ id: 'ToBackendRunQueriesRequestPayload' });

export let zToBackendRunQueriesRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendRunQueries)
  })
  .meta({ id: 'ToBackendRunQueriesRequestInfo' });

export let zToBackendRunQueriesRequest = zToBackendRequest
  .extend({
    info: zToBackendRunQueriesRequestInfo,
    payload: zToBackendRunQueriesRequestPayload
  })
  .meta({ id: 'ToBackendRunQueriesRequest' });

export let zToBackendRunQueriesResponsePayload = z
  .object({
    runningQueries: z.array(zQuery),
    startedQueryIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendRunQueriesResponsePayload' });

export let zToBackendRunQueriesResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendRunQueries}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendRunQueriesResponseInfo' });

export let zToBackendRunQueriesResponse = zMyResponse
  .extend({
    info: zToBackendRunQueriesResponseInfo,
    payload: zToBackendRunQueriesResponsePayload
  })
  .meta({ id: 'ToBackendRunQueriesResponse' });

export type ToBackendRunQueriesRequestPayload = z.infer<
  typeof zToBackendRunQueriesRequestPayload
>;
export type ToBackendRunQueriesRequest = z.infer<
  typeof zToBackendRunQueriesRequest
>;
export type ToBackendRunQueriesResponsePayload = z.infer<
  typeof zToBackendRunQueriesResponsePayload
>;
export type ToBackendRunQueriesResponse = z.infer<
  typeof zToBackendRunQueriesResponse
>;
