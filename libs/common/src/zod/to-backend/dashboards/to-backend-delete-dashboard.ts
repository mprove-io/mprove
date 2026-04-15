import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteDashboardRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    dashboardId: z.string()
  })
  .meta({ id: 'ToBackendDeleteDashboardRequestPayload' });

export let zToBackendDeleteDashboardRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteDashboard)
  })
  .meta({ id: 'ToBackendDeleteDashboardRequestInfo' });

export let zToBackendDeleteDashboardRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteDashboardRequestInfo,
    payload: zToBackendDeleteDashboardRequestPayload
  })
  .meta({ id: 'ToBackendDeleteDashboardRequest' });

export let zToBackendDeleteDashboardResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteDashboardResponsePayload' });

export let zToBackendDeleteDashboardResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendDeleteDashboard}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteDashboardResponseInfo' });

export let zToBackendDeleteDashboardResponse = zMyResponse
  .extend({
    info: zToBackendDeleteDashboardResponseInfo,
    payload: zToBackendDeleteDashboardResponsePayload
  })
  .meta({ id: 'ToBackendDeleteDashboardResponse' });

export type ToBackendDeleteDashboardRequestPayload = z.infer<
  typeof zToBackendDeleteDashboardRequestPayload
>;
export type ToBackendDeleteDashboardRequest = z.infer<
  typeof zToBackendDeleteDashboardRequest
>;
export type ToBackendDeleteDashboardResponsePayload = z.infer<
  typeof zToBackendDeleteDashboardResponsePayload
>;
export type ToBackendDeleteDashboardResponse = z.infer<
  typeof zToBackendDeleteDashboardResponse
>;
