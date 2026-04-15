import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteOrgRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToBackendDeleteOrgRequestPayload' });

export let zToBackendDeleteOrgRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteOrg)
  })
  .meta({ id: 'ToBackendDeleteOrgRequestInfo' });

export let zToBackendDeleteOrgRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteOrgRequestInfo,
    payload: zToBackendDeleteOrgRequestPayload
  })
  .meta({ id: 'ToBackendDeleteOrgRequest' });

export let zToBackendDeleteOrgResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteOrgResponsePayload' });

export let zToBackendDeleteOrgResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteOrg}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteOrgResponseInfo' });

export let zToBackendDeleteOrgResponse = zMyResponse
  .extend({
    info: zToBackendDeleteOrgResponseInfo,
    payload: zToBackendDeleteOrgResponsePayload
  })
  .meta({ id: 'ToBackendDeleteOrgResponse' });

export type ToBackendDeleteOrgRequestPayload = z.infer<
  typeof zToBackendDeleteOrgRequestPayload
>;
export type ToBackendDeleteOrgRequest = z.infer<
  typeof zToBackendDeleteOrgRequest
>;
export type ToBackendDeleteOrgResponsePayload = z.infer<
  typeof zToBackendDeleteOrgResponsePayload
>;
export type ToBackendDeleteOrgResponse = z.infer<
  typeof zToBackendDeleteOrgResponse
>;
