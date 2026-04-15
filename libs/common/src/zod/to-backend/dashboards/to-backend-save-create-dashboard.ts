import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zDashboardPart } from '#common/zod/backend/dashboard-part';
import { zTileX } from '#common/zod/backend/tile-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSaveCreateDashboardRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromDashboardId: z.string().nullish(),
    newDashboardId: z.string(),
    dashboardTitle: z.string().nullish(),
    accessRoles: z.string().nullish(),
    tilesGrid: z.array(zTileX).nullish(),
    timezone: z.string()
  })
  .meta({ id: 'ToBackendSaveCreateDashboardRequestPayload' });

export let zToBackendSaveCreateDashboardRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSaveCreateDashboard)
  })
  .meta({ id: 'ToBackendSaveCreateDashboardRequestInfo' });

export let zToBackendSaveCreateDashboardRequest = zToBackendRequest
  .extend({
    info: zToBackendSaveCreateDashboardRequestInfo,
    payload: zToBackendSaveCreateDashboardRequestPayload
  })
  .meta({ id: 'ToBackendSaveCreateDashboardRequest' });

export let zToBackendSaveCreateDashboardResponsePayload = z
  .object({
    newDashboardPart: zDashboardPart
  })
  .meta({ id: 'ToBackendSaveCreateDashboardResponsePayload' });

export let zToBackendSaveCreateDashboardResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSaveCreateDashboard}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSaveCreateDashboardResponseInfo' });

export let zToBackendSaveCreateDashboardResponse = zMyResponse
  .extend({
    info: zToBackendSaveCreateDashboardResponseInfo,
    payload: zToBackendSaveCreateDashboardResponsePayload
  })
  .meta({ id: 'ToBackendSaveCreateDashboardResponse' });

export type ToBackendSaveCreateDashboardRequestPayload = z.infer<
  typeof zToBackendSaveCreateDashboardRequestPayload
>;
export type ToBackendSaveCreateDashboardRequest = z.infer<
  typeof zToBackendSaveCreateDashboardRequest
>;
export type ToBackendSaveCreateDashboardResponsePayload = z.infer<
  typeof zToBackendSaveCreateDashboardResponsePayload
>;
export type ToBackendSaveCreateDashboardResponse = z.infer<
  typeof zToBackendSaveCreateDashboardResponse
>;
