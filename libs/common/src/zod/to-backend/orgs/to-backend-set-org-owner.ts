import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zOrg } from '#common/zod/backend/org';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetOrgOwnerRequestPayload = z
  .object({
    orgId: z.string(),
    ownerEmail: z.string()
  })
  .meta({ id: 'ToBackendSetOrgOwnerRequestPayload' });

export let zToBackendSetOrgOwnerRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner)
  })
  .meta({ id: 'ToBackendSetOrgOwnerRequestInfo' });

export let zToBackendSetOrgOwnerRequest = zToBackendRequest
  .extend({
    info: zToBackendSetOrgOwnerRequestInfo,
    payload: zToBackendSetOrgOwnerRequestPayload
  })
  .meta({ id: 'ToBackendSetOrgOwnerRequest' });

export let zToBackendSetOrgOwnerResponsePayload = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendSetOrgOwnerResponsePayload' });

export let zToBackendSetOrgOwnerResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetOrgOwnerResponseInfo' });

export let zToBackendSetOrgOwnerResponse = zMyResponse
  .extend({
    info: zToBackendSetOrgOwnerResponseInfo,
    payload: zToBackendSetOrgOwnerResponsePayload
  })
  .meta({ id: 'ToBackendSetOrgOwnerResponse' });

export type ToBackendSetOrgOwnerRequestPayload = z.infer<
  typeof zToBackendSetOrgOwnerRequestPayload
>;
export type ToBackendSetOrgOwnerRequest = z.infer<
  typeof zToBackendSetOrgOwnerRequest
>;
export type ToBackendSetOrgOwnerResponsePayload = z.infer<
  typeof zToBackendSetOrgOwnerResponsePayload
>;
export type ToBackendSetOrgOwnerResponse = z.infer<
  typeof zToBackendSetOrgOwnerResponse
>;
