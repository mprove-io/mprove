import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zRunChart } from '#common/zod/backend/run/run-chart';
import { zRunDashboard } from '#common/zod/backend/run/run-dashboard';
import { zRunReport } from '#common/zod/backend/run/run-report';
import { zMcliQueriesStats } from '#common/zod/mcli/mcli-queries-stats';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendRunRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    concurrency: z.number().int().positive().nullish(),
    wait: z.boolean(),
    sleep: z.number().nullish(),
    dashboardIds: z.string().nullish(),
    chartIds: z.string().nullish(),
    noDashboards: z.boolean(),
    noCharts: z.boolean(),
    getDashboards: z.boolean(),
    getCharts: z.boolean(),
    reportIds: z.string().nullish(),
    noReports: z.boolean(),
    getReports: z.boolean()
  })
  .meta({ id: 'ToBackendRunRequestPayload' });

export let zToBackendRunRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendRun)
  })
  .meta({ id: 'ToBackendRunRequestInfo' });

export let zToBackendRunRequest = zToBackendRequest
  .extend({
    info: zToBackendRunRequestInfo,
    payload: zToBackendRunRequestPayload
  })
  .meta({ id: 'ToBackendRunRequest' });

export let zToBackendRunResponsePayload = z
  .object({
    charts: z.array(zRunChart),
    dashboards: z.array(zRunDashboard),
    errorCharts: z.array(zRunChart),
    errorDashboards: z.array(zRunDashboard),
    reports: z.array(zRunReport),
    errorReports: z.array(zRunReport),
    queriesStats: zMcliQueriesStats
  })
  .meta({ id: 'ToBackendRunResponsePayload' });

export let zToBackendRunResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendRun}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendRunResponseInfo' });

export let zToBackendRunResponse = zMyResponse
  .extend({
    info: zToBackendRunResponseInfo,
    payload: zToBackendRunResponsePayload
  })
  .meta({ id: 'ToBackendRunResponse' });

export type ToBackendRunRequestPayload = z.infer<
  typeof zToBackendRunRequestPayload
>;
export type ToBackendRunRequest = z.infer<typeof zToBackendRunRequest>;
export type ToBackendRunResponsePayload = z.infer<
  typeof zToBackendRunResponsePayload
>;
export type ToBackendRunResponse = z.infer<typeof zToBackendRunResponse>;
