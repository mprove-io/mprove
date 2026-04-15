import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zDashboardX } from '#common/zod/backend/dashboard-x';
import { zDashboardField } from '#common/zod/blockml/dashboard-field';
import { zTile } from '#common/zod/blockml/tile';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditDraftDashboardRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    oldDashboardId: z.string(),
    newDashboardId: z.string(),
    newDashboardFields: z.array(zDashboardField),
    tiles: z.array(zTile),
    timezone: z.string()
  })
  .meta({ id: 'ToBackendEditDraftDashboardRequestPayload' });

export let zToBackendEditDraftDashboardRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditDraftDashboard)
  })
  .meta({ id: 'ToBackendEditDraftDashboardRequestInfo' });

export let zToBackendEditDraftDashboardRequest = zToBackendRequest
  .extend({
    info: zToBackendEditDraftDashboardRequestInfo,
    payload: zToBackendEditDraftDashboardRequestPayload
  })
  .meta({ id: 'ToBackendEditDraftDashboardRequest' });

export let zToBackendEditDraftDashboardResponsePayload = z
  .object({
    dashboard: zDashboardX
  })
  .meta({ id: 'ToBackendEditDraftDashboardResponsePayload' });

export let zToBackendEditDraftDashboardResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendEditDraftDashboard}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditDraftDashboardResponseInfo' });

export let zToBackendEditDraftDashboardResponse = zMyResponse
  .extend({
    info: zToBackendEditDraftDashboardResponseInfo,
    payload: zToBackendEditDraftDashboardResponsePayload
  })
  .meta({ id: 'ToBackendEditDraftDashboardResponse' });

export type ToBackendEditDraftDashboardRequestPayload = z.infer<
  typeof zToBackendEditDraftDashboardRequestPayload
>;
export type ToBackendEditDraftDashboardRequest = z.infer<
  typeof zToBackendEditDraftDashboardRequest
>;
export type ToBackendEditDraftDashboardResponsePayload = z.infer<
  typeof zToBackendEditDraftDashboardResponsePayload
>;
export type ToBackendEditDraftDashboardResponse = z.infer<
  typeof zToBackendEditDraftDashboardResponse
>;
