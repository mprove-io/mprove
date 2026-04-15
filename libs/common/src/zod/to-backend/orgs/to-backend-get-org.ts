import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zOrg } from '#common/zod/backend/org';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetOrgRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToBackendGetOrgRequestPayload' });

export let zToBackendGetOrgRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetOrg)
  })
  .meta({ id: 'ToBackendGetOrgRequestInfo' });

export let zToBackendGetOrgRequest = zToBackendRequest
  .extend({
    info: zToBackendGetOrgRequestInfo,
    payload: zToBackendGetOrgRequestPayload
  })
  .meta({ id: 'ToBackendGetOrgRequest' });

export let zToBackendGetOrgResponsePayload = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendGetOrgResponsePayload' });

export let zToBackendGetOrgResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetOrg}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetOrgResponseInfo' });

export let zToBackendGetOrgResponse = zMyResponse
  .extend({
    info: zToBackendGetOrgResponseInfo,
    payload: zToBackendGetOrgResponsePayload
  })
  .meta({ id: 'ToBackendGetOrgResponse' });

export type ToBackendGetOrgRequestPayload = z.infer<
  typeof zToBackendGetOrgRequestPayload
>;
export type ToBackendGetOrgRequest = z.infer<typeof zToBackendGetOrgRequest>;
export type ToBackendGetOrgResponsePayload = z.infer<
  typeof zToBackendGetOrgResponsePayload
>;
export type ToBackendGetOrgResponse = z.infer<typeof zToBackendGetOrgResponse>;
