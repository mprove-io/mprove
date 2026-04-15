import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zQueryInfoChart } from '#common/zod/backend/query-info/query-info-chart';
import { zQueryInfoDashboard } from '#common/zod/backend/query-info/query-info-dashboard';
import { zQueryInfoReport } from '#common/zod/backend/query-info/query-info-report';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetQueryInfoRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartId: z.string().nullish(),
    dashboardId: z.string().nullish(),
    tileIndex: z.number().nullish(),
    reportId: z.string().nullish(),
    rowId: z.string().nullish(),
    timezone: z.string(),
    timeSpec: z.enum(TimeSpecEnum).nullish(),
    timeRangeFractionBrick: z.string().nullish(),
    getMalloy: z.boolean(),
    getSql: z.boolean(),
    getData: z.boolean(),
    isFetch: z.boolean()
  })
  .meta({ id: 'ToBackendGetQueryInfoRequestPayload' });

export let zToBackendGetQueryInfoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetQueryInfo)
  })
  .meta({ id: 'ToBackendGetQueryInfoRequestInfo' });

export let zToBackendGetQueryInfoRequest = zToBackendRequest
  .extend({
    info: zToBackendGetQueryInfoRequestInfo,
    payload: zToBackendGetQueryInfoRequestPayload
  })
  .meta({ id: 'ToBackendGetQueryInfoRequest' });

export let zToBackendGetQueryInfoResponsePayload = z
  .object({
    chart: zQueryInfoChart.nullish(),
    dashboard: zQueryInfoDashboard.nullish(),
    report: zQueryInfoReport.nullish()
  })
  .meta({ id: 'ToBackendGetQueryInfoResponsePayload' });

export let zToBackendGetQueryInfoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetQueryInfo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetQueryInfoResponseInfo' });

export let zToBackendGetQueryInfoResponse = zMyResponse
  .extend({
    info: zToBackendGetQueryInfoResponseInfo,
    payload: zToBackendGetQueryInfoResponsePayload
  })
  .meta({ id: 'ToBackendGetQueryInfoResponse' });

export type ToBackendGetQueryInfoRequestPayload = z.infer<
  typeof zToBackendGetQueryInfoRequestPayload
>;
export type ToBackendGetQueryInfoRequest = z.infer<
  typeof zToBackendGetQueryInfoRequest
>;
export type ToBackendGetQueryInfoResponsePayload = z.infer<
  typeof zToBackendGetQueryInfoResponsePayload
>;
export type ToBackendGetQueryInfoResponse = z.infer<
  typeof zToBackendGetQueryInfoResponse
>;
