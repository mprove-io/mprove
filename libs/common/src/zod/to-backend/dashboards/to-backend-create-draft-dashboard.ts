import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zDashboardPart } from '#common/zod/backend/dashboard-part';
import { zDashboardX } from '#common/zod/backend/dashboard-x';
import { zDashboardField } from '#common/zod/blockml/dashboard-field';
import { zTile } from '#common/zod/blockml/tile';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateDraftDashboardRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    oldDashboardId: z.string(),
    newDashboardId: z.string(),
    newDashboardFields: z.array(zDashboardField),
    tiles: z.array(zTile),
    timezone: z.string(),
    isQueryCache: z.boolean(),
    cachedQueryMconfigIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendCreateDraftDashboardRequestPayload' });

export let zToBackendCreateDraftDashboardRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateDraftDashboard)
  })
  .meta({ id: 'ToBackendCreateDraftDashboardRequestInfo' });

export let zToBackendCreateDraftDashboardRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateDraftDashboardRequestInfo,
    payload: zToBackendCreateDraftDashboardRequestPayload
  })
  .meta({ id: 'ToBackendCreateDraftDashboardRequest' });

export let zToBackendCreateDraftDashboardResponsePayload = z
  .object({
    newDashboardPart: zDashboardPart,
    dashboard: zDashboardX
  })
  .meta({ id: 'ToBackendCreateDraftDashboardResponsePayload' });

export let zToBackendCreateDraftDashboardResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendCreateDraftDashboard}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateDraftDashboardResponseInfo' });

export let zToBackendCreateDraftDashboardResponse = zMyResponse
  .extend({
    info: zToBackendCreateDraftDashboardResponseInfo,
    payload: zToBackendCreateDraftDashboardResponsePayload
  })
  .meta({ id: 'ToBackendCreateDraftDashboardResponse' });

export type ToBackendCreateDraftDashboardRequestPayload = z.infer<
  typeof zToBackendCreateDraftDashboardRequestPayload
>;
export type ToBackendCreateDraftDashboardRequest = z.infer<
  typeof zToBackendCreateDraftDashboardRequest
>;
export type ToBackendCreateDraftDashboardResponsePayload = z.infer<
  typeof zToBackendCreateDraftDashboardResponsePayload
>;
export type ToBackendCreateDraftDashboardResponse = z.infer<
  typeof zToBackendCreateDraftDashboardResponse
>;
