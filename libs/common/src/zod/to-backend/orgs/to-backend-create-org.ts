import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zOrg } from '#common/zod/backend/org';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateOrgRequestPayload = z
  .object({
    name: z.string()
  })
  .meta({ id: 'ToBackendCreateOrgRequestPayload' });

export let zToBackendCreateOrgRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateOrg)
  })
  .meta({ id: 'ToBackendCreateOrgRequestInfo' });

export let zToBackendCreateOrgRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateOrgRequestInfo,
    payload: zToBackendCreateOrgRequestPayload
  })
  .meta({ id: 'ToBackendCreateOrgRequest' });

export let zToBackendCreateOrgResponsePayload = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendCreateOrgResponsePayload' });

export let zToBackendCreateOrgResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateOrg}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateOrgResponseInfo' });

export let zToBackendCreateOrgResponse = zMyResponse
  .extend({
    info: zToBackendCreateOrgResponseInfo,
    payload: zToBackendCreateOrgResponsePayload
  })
  .meta({ id: 'ToBackendCreateOrgResponse' });

export type ToBackendCreateOrgRequestPayload = z.infer<
  typeof zToBackendCreateOrgRequestPayload
>;
export type ToBackendCreateOrgRequest = z.infer<
  typeof zToBackendCreateOrgRequest
>;
export type ToBackendCreateOrgResponsePayload = z.infer<
  typeof zToBackendCreateOrgResponsePayload
>;
export type ToBackendCreateOrgResponse = z.infer<
  typeof zToBackendCreateOrgResponse
>;
