import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zOrgsItem } from '#common/zod/backend/orgs-item';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetOrgsListRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendGetOrgsListRequestPayload' });

export let zToBackendGetOrgsListRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetOrgsList)
  })
  .meta({ id: 'ToBackendGetOrgsListRequestInfo' });

export let zToBackendGetOrgsListRequest = zToBackendRequest
  .extend({
    info: zToBackendGetOrgsListRequestInfo,
    payload: zToBackendGetOrgsListRequestPayload
  })
  .meta({ id: 'ToBackendGetOrgsListRequest' });

export let zToBackendGetOrgsListResponsePayload = z
  .object({
    orgsList: z.array(zOrgsItem)
  })
  .meta({ id: 'ToBackendGetOrgsListResponsePayload' });

export let zToBackendGetOrgsListResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetOrgsList}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetOrgsListResponseInfo' });

export let zToBackendGetOrgsListResponse = zMyResponse
  .extend({
    info: zToBackendGetOrgsListResponseInfo,
    payload: zToBackendGetOrgsListResponsePayload
  })
  .meta({ id: 'ToBackendGetOrgsListResponse' });

export type ToBackendGetOrgsListRequestPayload = z.infer<
  typeof zToBackendGetOrgsListRequestPayload
>;
export type ToBackendGetOrgsListRequest = z.infer<
  typeof zToBackendGetOrgsListRequest
>;
export type ToBackendGetOrgsListResponsePayload = z.infer<
  typeof zToBackendGetOrgsListResponsePayload
>;
export type ToBackendGetOrgsListResponse = z.infer<
  typeof zToBackendGetOrgsListResponse
>;
