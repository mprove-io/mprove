import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zDashboardPart } from '#common/zod/backend/dashboard-part';
import { zDashboardX } from '#common/zod/backend/dashboard-x';
import { zTileX } from '#common/zod/backend/tile-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSaveModifyDashboardRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    toDashboardId: z.string(),
    fromDashboardId: z.string(),
    newTile: zTileX.nullish(),
    isReplaceTile: z.boolean().nullish(),
    selectedTileTitle: z.string().nullish(),
    dashboardTitle: z.string().nullish(),
    accessRoles: z.string().nullish(),
    tilesGrid: z.array(zTileX).nullish(),
    timezone: z.string()
  })
  .meta({ id: 'ToBackendSaveModifyDashboardRequestPayload' });

export let zToBackendSaveModifyDashboardRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSaveModifyDashboard)
  })
  .meta({ id: 'ToBackendSaveModifyDashboardRequestInfo' });

export let zToBackendSaveModifyDashboardRequest = zToBackendRequest
  .extend({
    info: zToBackendSaveModifyDashboardRequestInfo,
    payload: zToBackendSaveModifyDashboardRequestPayload
  })
  .meta({ id: 'ToBackendSaveModifyDashboardRequest' });

export let zToBackendSaveModifyDashboardResponsePayload = z
  .object({
    dashboard: zDashboardX,
    newDashboardPart: zDashboardPart
  })
  .meta({ id: 'ToBackendSaveModifyDashboardResponsePayload' });

export let zToBackendSaveModifyDashboardResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSaveModifyDashboard}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSaveModifyDashboardResponseInfo' });

export let zToBackendSaveModifyDashboardResponse = zMyResponse
  .extend({
    info: zToBackendSaveModifyDashboardResponseInfo,
    payload: zToBackendSaveModifyDashboardResponsePayload
  })
  .meta({ id: 'ToBackendSaveModifyDashboardResponse' });

export type ToBackendSaveModifyDashboardRequestPayload = z.infer<
  typeof zToBackendSaveModifyDashboardRequestPayload
>;
export type ToBackendSaveModifyDashboardRequest = z.infer<
  typeof zToBackendSaveModifyDashboardRequest
>;
export type ToBackendSaveModifyDashboardResponsePayload = z.infer<
  typeof zToBackendSaveModifyDashboardResponsePayload
>;
export type ToBackendSaveModifyDashboardResponse = z.infer<
  typeof zToBackendSaveModifyDashboardResponse
>;
