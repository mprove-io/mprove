import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMproveValidationError } from '#common/zod/backend/state/mprove-validation-error';
import { zStateChartItem } from '#common/zod/backend/state/state-chart-item';
import { zStateDashboardItem } from '#common/zod/backend/state/state-dashboard-item';
import { zStateMetricItem } from '#common/zod/backend/state/state-metric-item';
import { zStateModelItem } from '#common/zod/backend/state/state-model-item';
import { zStateReportItem } from '#common/zod/backend/state/state-report-item';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetStateRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    isFetch: z.boolean(),
    getErrors: z.boolean(),
    getRepo: z.boolean(),
    getRepoNodes: z.boolean(),
    getModels: z.boolean(),
    getDashboards: z.boolean(),
    getCharts: z.boolean(),
    getMetrics: z.boolean(),
    getReports: z.boolean()
  })
  .meta({ id: 'ToBackendGetStateRequestPayload' });

export let zToBackendGetStateRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetState)
  })
  .meta({ id: 'ToBackendGetStateRequestInfo' });

export let zToBackendGetStateRequest = zToBackendRequest
  .extend({
    info: zToBackendGetStateRequestInfo,
    payload: zToBackendGetStateRequestPayload
  })
  .meta({ id: 'ToBackendGetStateRequest' });

export let zToBackendGetStateResponsePayload = z
  .object({
    needValidate: z.boolean(),
    structId: z.string(),
    validationErrorsTotal: z.number(),
    modelsTotal: z.number(),
    chartsTotal: z.number(),
    dashboardsTotal: z.number(),
    reportsTotal: z.number(),
    builderUrl: z.string(),
    validationErrors: z.array(zMproveValidationError),
    modelItems: z.array(zStateModelItem),
    chartItems: z.array(zStateChartItem),
    dashboardItems: z.array(zStateDashboardItem),
    reportItems: z.array(zStateReportItem),
    metricItems: z.array(zStateMetricItem),
    repo: zRepo.nullish()
  })
  .meta({ id: 'ToBackendGetStateResponsePayload' });

export let zToBackendGetStateResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetState}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetStateResponseInfo' });

export let zToBackendGetStateResponse = zMyResponse
  .extend({
    info: zToBackendGetStateResponseInfo,
    payload: zToBackendGetStateResponsePayload
  })
  .meta({ id: 'ToBackendGetStateResponse' });

export type ToBackendGetStateRequestPayload = z.infer<
  typeof zToBackendGetStateRequestPayload
>;
export type ToBackendGetStateRequest = z.infer<
  typeof zToBackendGetStateRequest
>;
export type ToBackendGetStateResponsePayload = z.infer<
  typeof zToBackendGetStateResponsePayload
>;
export type ToBackendGetStateResponse = z.infer<
  typeof zToBackendGetStateResponse
>;
