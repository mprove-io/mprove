import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zOrg } from '#common/zod/backend/org';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetOrgInfoRequestPayload = z
  .object({
    orgId: z.string(),
    name: z.string().nullish()
  })
  .meta({ id: 'ToBackendSetOrgInfoRequestPayload' });

export let zToBackendSetOrgInfoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo)
  })
  .meta({ id: 'ToBackendSetOrgInfoRequestInfo' });

export let zToBackendSetOrgInfoRequest = zToBackendRequest
  .extend({
    info: zToBackendSetOrgInfoRequestInfo,
    payload: zToBackendSetOrgInfoRequestPayload
  })
  .meta({ id: 'ToBackendSetOrgInfoRequest' });

export let zToBackendSetOrgInfoResponsePayload = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendSetOrgInfoResponsePayload' });

export let zToBackendSetOrgInfoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetOrgInfoResponseInfo' });

export let zToBackendSetOrgInfoResponse = zMyResponse
  .extend({
    info: zToBackendSetOrgInfoResponseInfo,
    payload: zToBackendSetOrgInfoResponsePayload
  })
  .meta({ id: 'ToBackendSetOrgInfoResponse' });

export type ToBackendSetOrgInfoRequestPayload = z.infer<
  typeof zToBackendSetOrgInfoRequestPayload
>;
export type ToBackendSetOrgInfoRequest = z.infer<
  typeof zToBackendSetOrgInfoRequest
>;
export type ToBackendSetOrgInfoResponsePayload = z.infer<
  typeof zToBackendSetOrgInfoResponsePayload
>;
export type ToBackendSetOrgInfoResponse = z.infer<
  typeof zToBackendSetOrgInfoResponse
>;
