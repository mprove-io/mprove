import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zChartX } from '#common/zod/backend/chart-x';
import { zMconfigX } from '#common/zod/backend/mconfig-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSaveCreateChartRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromChartId: z.string(),
    newChartId: z.string(),
    tileTitle: z.string(),
    mconfig: zMconfigX
  })
  .meta({ id: 'ToBackendSaveCreateChartRequestPayload' });

export let zToBackendSaveCreateChartRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSaveCreateChart)
  })
  .meta({ id: 'ToBackendSaveCreateChartRequestInfo' });

export let zToBackendSaveCreateChartRequest = zToBackendRequest
  .extend({
    info: zToBackendSaveCreateChartRequestInfo,
    payload: zToBackendSaveCreateChartRequestPayload
  })
  .meta({ id: 'ToBackendSaveCreateChartRequest' });

export let zToBackendSaveCreateChartResponsePayload = z
  .object({
    chart: zChartX
  })
  .meta({ id: 'ToBackendSaveCreateChartResponsePayload' });

export let zToBackendSaveCreateChartResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSaveCreateChart}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSaveCreateChartResponseInfo' });

export let zToBackendSaveCreateChartResponse = zMyResponse
  .extend({
    info: zToBackendSaveCreateChartResponseInfo,
    payload: zToBackendSaveCreateChartResponsePayload
  })
  .meta({ id: 'ToBackendSaveCreateChartResponse' });

export type ToBackendSaveCreateChartRequestPayload = z.infer<
  typeof zToBackendSaveCreateChartRequestPayload
>;
export type ToBackendSaveCreateChartRequest = z.infer<
  typeof zToBackendSaveCreateChartRequest
>;
export type ToBackendSaveCreateChartResponsePayload = z.infer<
  typeof zToBackendSaveCreateChartResponsePayload
>;
export type ToBackendSaveCreateChartResponse = z.infer<
  typeof zToBackendSaveCreateChartResponse
>;
