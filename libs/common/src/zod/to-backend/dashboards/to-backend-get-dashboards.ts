import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zDashboardPart } from '#common/zod/backend/dashboard-part';
import { zMember } from '#common/zod/backend/member';
import { zModelX } from '#common/zod/backend/model-x';
import { zStructX } from '#common/zod/backend/struct-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetDashboardsRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetDashboardsRequestPayload' });

export let zToBackendGetDashboardsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetDashboards)
  })
  .meta({ id: 'ToBackendGetDashboardsRequestInfo' });

export let zToBackendGetDashboardsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetDashboardsRequestInfo,
    payload: zToBackendGetDashboardsRequestPayload
  })
  .meta({ id: 'ToBackendGetDashboardsRequest' });

export let zToBackendGetDashboardsResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    models: z.array(zModelX),
    dashboardParts: z.array(zDashboardPart)
  })
  .meta({ id: 'ToBackendGetDashboardsResponsePayload' });

export let zToBackendGetDashboardsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetDashboards}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetDashboardsResponseInfo' });

export let zToBackendGetDashboardsResponse = zMyResponse
  .extend({
    info: zToBackendGetDashboardsResponseInfo,
    payload: zToBackendGetDashboardsResponsePayload
  })
  .meta({ id: 'ToBackendGetDashboardsResponse' });

export type ToBackendGetDashboardsRequestPayload = z.infer<
  typeof zToBackendGetDashboardsRequestPayload
>;
export type ToBackendGetDashboardsRequest = z.infer<
  typeof zToBackendGetDashboardsRequest
>;
export type ToBackendGetDashboardsResponsePayload = z.infer<
  typeof zToBackendGetDashboardsResponsePayload
>;
export type ToBackendGetDashboardsResponse = z.infer<
  typeof zToBackendGetDashboardsResponse
>;
