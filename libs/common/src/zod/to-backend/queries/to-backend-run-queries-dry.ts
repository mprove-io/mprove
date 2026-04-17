import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zQueryEstimate } from '#common/zod/backend/query-estimate';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendRunQueriesDryRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfigIds: z.array(z.string()).min(1),
    dryId: z.string()
  })
  .meta({ id: 'ToBackendRunQueriesDryRequestPayload' });

export let zToBackendRunQueriesDryRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry)
  })
  .meta({ id: 'ToBackendRunQueriesDryRequestInfo' });

export let zToBackendRunQueriesDryRequest = zToBackendRequest
  .extend({
    info: zToBackendRunQueriesDryRequestInfo,
    payload: zToBackendRunQueriesDryRequestPayload
  })
  .meta({ id: 'ToBackendRunQueriesDryRequest' });

export let zToBackendRunQueriesDryResponsePayload = z
  .object({
    dryId: z.string(),
    validQueryEstimates: z.array(zQueryEstimate),
    errorQueries: z.array(zQuery)
  })
  .meta({ id: 'ToBackendRunQueriesDryResponsePayload' });

export let zToBackendRunQueriesDryResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendRunQueriesDryResponseInfo' });

export let zToBackendRunQueriesDryResponse = zMyResponse
  .extend({
    info: zToBackendRunQueriesDryResponseInfo,
    payload: zToBackendRunQueriesDryResponsePayload
  })
  .meta({ id: 'ToBackendRunQueriesDryResponse' });

export type ToBackendRunQueriesDryRequestPayload = z.infer<
  typeof zToBackendRunQueriesDryRequestPayload
>;
export type ToBackendRunQueriesDryRequest = z.infer<
  typeof zToBackendRunQueriesDryRequest
>;
export type ToBackendRunQueriesDryResponsePayload = z.infer<
  typeof zToBackendRunQueriesDryResponsePayload
>;
export type ToBackendRunQueriesDryResponse = z.infer<
  typeof zToBackendRunQueriesDryResponse
>;
