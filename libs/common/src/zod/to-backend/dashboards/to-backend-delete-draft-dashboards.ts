import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteDraftDashboardsRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    dashboardIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsRequestPayload' });

export let zToBackendDeleteDraftDashboardsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteDraftDashboards)
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsRequestInfo' });

export let zToBackendDeleteDraftDashboardsRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteDraftDashboardsRequestInfo,
    payload: zToBackendDeleteDraftDashboardsRequestPayload
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsRequest' });

export let zToBackendDeleteDraftDashboardsResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteDraftDashboardsResponsePayload' });

export let zToBackendDeleteDraftDashboardsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendDeleteDraftDashboards}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsResponseInfo' });

export let zToBackendDeleteDraftDashboardsResponse = zMyResponse
  .extend({
    info: zToBackendDeleteDraftDashboardsResponseInfo,
    payload: zToBackendDeleteDraftDashboardsResponsePayload
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsResponse' });

export type ToBackendDeleteDraftDashboardsRequestPayload = z.infer<
  typeof zToBackendDeleteDraftDashboardsRequestPayload
>;
export type ToBackendDeleteDraftDashboardsRequest = z.infer<
  typeof zToBackendDeleteDraftDashboardsRequest
>;
export type ToBackendDeleteDraftDashboardsResponsePayload = z.infer<
  typeof zToBackendDeleteDraftDashboardsResponsePayload
>;
export type ToBackendDeleteDraftDashboardsResponse = z.infer<
  typeof zToBackendDeleteDraftDashboardsResponse
>;
