import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetQueryRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigId: z.string(),
    queryId: z.string()
  })
  .meta({ id: 'ToBackendGetQueryRequestPayload' });

export let zToBackendGetQueryRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetQuery)
  })
  .meta({ id: 'ToBackendGetQueryRequestInfo' });

export let zToBackendGetQueryRequest = zToBackendRequest
  .extend({
    info: zToBackendGetQueryRequestInfo,
    payload: zToBackendGetQueryRequestPayload
  })
  .meta({ id: 'ToBackendGetQueryRequest' });

export let zToBackendGetQueryResponsePayload = z
  .object({
    query: zQuery
  })
  .meta({ id: 'ToBackendGetQueryResponsePayload' });

export let zToBackendGetQueryResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetQuery}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetQueryResponseInfo' });

export let zToBackendGetQueryResponse = zMyResponse
  .extend({
    info: zToBackendGetQueryResponseInfo,
    payload: zToBackendGetQueryResponsePayload
  })
  .meta({ id: 'ToBackendGetQueryResponse' });

export type ToBackendGetQueryRequestPayload = z.infer<
  typeof zToBackendGetQueryRequestPayload
>;
export type ToBackendGetQueryRequest = z.infer<
  typeof zToBackendGetQueryRequest
>;
export type ToBackendGetQueryResponsePayload = z.infer<
  typeof zToBackendGetQueryResponsePayload
>;
export type ToBackendGetQueryResponse = z.infer<
  typeof zToBackendGetQueryResponse
>;
