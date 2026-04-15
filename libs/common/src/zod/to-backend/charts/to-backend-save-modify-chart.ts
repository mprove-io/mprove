import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zChartX } from '#common/zod/backend/chart-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSaveModifyChartRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromChartId: z.string(),
    chartId: z.string(),
    tileTitle: z.string(),
    timezone: z.string()
  })
  .meta({ id: 'ToBackendSaveModifyChartRequestPayload' });

export let zToBackendSaveModifyChartRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSaveModifyChart)
  })
  .meta({ id: 'ToBackendSaveModifyChartRequestInfo' });

export let zToBackendSaveModifyChartRequest = zToBackendRequest
  .extend({
    info: zToBackendSaveModifyChartRequestInfo,
    payload: zToBackendSaveModifyChartRequestPayload
  })
  .meta({ id: 'ToBackendSaveModifyChartRequest' });

export let zToBackendSaveModifyChartResponsePayload = z
  .object({
    chart: zChartX,
    chartPart: zChartX
  })
  .meta({ id: 'ToBackendSaveModifyChartResponsePayload' });

export let zToBackendSaveModifyChartResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSaveModifyChart}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSaveModifyChartResponseInfo' });

export let zToBackendSaveModifyChartResponse = zMyResponse
  .extend({
    info: zToBackendSaveModifyChartResponseInfo,
    payload: zToBackendSaveModifyChartResponsePayload
  })
  .meta({ id: 'ToBackendSaveModifyChartResponse' });

export type ToBackendSaveModifyChartRequestPayload = z.infer<
  typeof zToBackendSaveModifyChartRequestPayload
>;
export type ToBackendSaveModifyChartRequest = z.infer<
  typeof zToBackendSaveModifyChartRequest
>;
export type ToBackendSaveModifyChartResponsePayload = z.infer<
  typeof zToBackendSaveModifyChartResponsePayload
>;
export type ToBackendSaveModifyChartResponse = z.infer<
  typeof zToBackendSaveModifyChartResponse
>;
