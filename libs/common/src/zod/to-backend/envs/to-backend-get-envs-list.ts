import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zEnvsItem } from '#common/zod/backend/envs-item';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetEnvsListRequestPayload = z
  .object({
    projectId: z.string(),
    isFilter: z.boolean()
  })
  .meta({ id: 'ToBackendGetEnvsListRequestPayload' });

export let zToBackendGetEnvsListRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetEnvsList)
  })
  .meta({ id: 'ToBackendGetEnvsListRequestInfo' });

export let zToBackendGetEnvsListRequest = zToBackendRequest
  .extend({
    info: zToBackendGetEnvsListRequestInfo,
    payload: zToBackendGetEnvsListRequestPayload
  })
  .meta({ id: 'ToBackendGetEnvsListRequest' });

export let zToBackendGetEnvsListResponsePayload = z
  .object({
    envsList: z.array(zEnvsItem)
  })
  .meta({ id: 'ToBackendGetEnvsListResponsePayload' });

export let zToBackendGetEnvsListResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetEnvsList}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetEnvsListResponseInfo' });

export let zToBackendGetEnvsListResponse = zMyResponse
  .extend({
    info: zToBackendGetEnvsListResponseInfo,
    payload: zToBackendGetEnvsListResponsePayload
  })
  .meta({ id: 'ToBackendGetEnvsListResponse' });

export type ToBackendGetEnvsListRequestPayload = z.infer<
  typeof zToBackendGetEnvsListRequestPayload
>;
export type ToBackendGetEnvsListRequest = z.infer<
  typeof zToBackendGetEnvsListRequest
>;
export type ToBackendGetEnvsListResponsePayload = z.infer<
  typeof zToBackendGetEnvsListResponsePayload
>;
export type ToBackendGetEnvsListResponse = z.infer<
  typeof zToBackendGetEnvsListResponse
>;
