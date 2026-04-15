import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zChartX } from '#common/zod/backend/chart-x';
import { zMconfigX } from '#common/zod/backend/mconfig-x';
import { zQueryOperation } from '#common/zod/backend/query-operation';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateDraftChartRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfig: zMconfigX,
    isKeepQueryId: z.boolean().nullish(),
    cellMetricsStartDateMs: z.number().nullish(),
    cellMetricsEndDateMs: z.number().nullish(),
    queryOperation: zQueryOperation.nullish()
  })
  .meta({ id: 'ToBackendCreateDraftChartRequestPayload' });

export let zToBackendCreateDraftChartRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateDraftChart)
  })
  .meta({ id: 'ToBackendCreateDraftChartRequestInfo' });

export let zToBackendCreateDraftChartRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateDraftChartRequestInfo,
    payload: zToBackendCreateDraftChartRequestPayload
  })
  .meta({ id: 'ToBackendCreateDraftChartRequest' });

export let zToBackendCreateDraftChartResponsePayload = z
  .object({
    chart: zChartX
  })
  .meta({ id: 'ToBackendCreateDraftChartResponsePayload' });

export let zToBackendCreateDraftChartResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendCreateDraftChart}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateDraftChartResponseInfo' });

export let zToBackendCreateDraftChartResponse = zMyResponse
  .extend({
    info: zToBackendCreateDraftChartResponseInfo,
    payload: zToBackendCreateDraftChartResponsePayload
  })
  .meta({ id: 'ToBackendCreateDraftChartResponse' });

export type ToBackendCreateDraftChartRequestPayload = z.infer<
  typeof zToBackendCreateDraftChartRequestPayload
>;
export type ToBackendCreateDraftChartRequest = z.infer<
  typeof zToBackendCreateDraftChartRequest
>;
export type ToBackendCreateDraftChartResponsePayload = z.infer<
  typeof zToBackendCreateDraftChartResponsePayload
>;
export type ToBackendCreateDraftChartResponse = z.infer<
  typeof zToBackendCreateDraftChartResponse
>;
