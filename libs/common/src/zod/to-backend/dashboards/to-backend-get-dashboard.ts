import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zDashboardX } from '#common/zod/backend/dashboard-x';
import { zMember } from '#common/zod/backend/member';
import { zStructX } from '#common/zod/backend/struct-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';
import { zTimezone } from '#common/zod/z-timezone';

export let zToBackendGetDashboardRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    dashboardId: z.string(),
    timezone: zTimezone
  })
  .meta({ id: 'ToBackendGetDashboardRequestPayload' });

export let zToBackendGetDashboardRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetDashboard)
  })
  .meta({ id: 'ToBackendGetDashboardRequestInfo' });

export let zToBackendGetDashboardRequest = zToBackendRequest
  .extend({
    info: zToBackendGetDashboardRequestInfo,
    payload: zToBackendGetDashboardRequestPayload
  })
  .meta({ id: 'ToBackendGetDashboardRequest' });

export let zToBackendGetDashboardResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    dashboard: zDashboardX
  })
  .meta({ id: 'ToBackendGetDashboardResponsePayload' });

export let zToBackendGetDashboardResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetDashboard}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetDashboardResponseInfo' });

export let zToBackendGetDashboardResponse = zMyResponse
  .extend({
    info: zToBackendGetDashboardResponseInfo,
    payload: zToBackendGetDashboardResponsePayload
  })
  .meta({ id: 'ToBackendGetDashboardResponse' });

export type ToBackendGetDashboardRequestPayload = z.infer<
  typeof zToBackendGetDashboardRequestPayload
>;
export type ToBackendGetDashboardRequest = z.infer<
  typeof zToBackendGetDashboardRequest
>;
export type ToBackendGetDashboardResponsePayload = z.infer<
  typeof zToBackendGetDashboardResponsePayload
>;
export type ToBackendGetDashboardResponse = z.infer<
  typeof zToBackendGetDashboardResponse
>;
