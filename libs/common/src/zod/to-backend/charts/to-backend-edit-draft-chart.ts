import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zChartX } from '#common/zod/backend/chart-x';
import { zMconfigX } from '#common/zod/backend/mconfig-x';
import { zQueryOperation } from '#common/zod/backend/query-operation';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditDraftChartRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartId: z.string(),
    mconfig: zMconfigX,
    queryOperation: zQueryOperation.nullish()
  })
  .meta({ id: 'ToBackendEditDraftChartRequestPayload' });

export let zToBackendEditDraftChartRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditDraftChart)
  })
  .meta({ id: 'ToBackendEditDraftChartRequestInfo' });

export let zToBackendEditDraftChartRequest = zToBackendRequest
  .extend({
    info: zToBackendEditDraftChartRequestInfo,
    payload: zToBackendEditDraftChartRequestPayload
  })
  .meta({ id: 'ToBackendEditDraftChartRequest' });

export let zToBackendEditDraftChartResponsePayload = z
  .object({
    chart: zChartX
  })
  .meta({ id: 'ToBackendEditDraftChartResponsePayload' });

export let zToBackendEditDraftChartResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendEditDraftChart}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditDraftChartResponseInfo' });

export let zToBackendEditDraftChartResponse = zMyResponse
  .extend({
    info: zToBackendEditDraftChartResponseInfo,
    payload: zToBackendEditDraftChartResponsePayload
  })
  .meta({ id: 'ToBackendEditDraftChartResponse' });

export type ToBackendEditDraftChartRequestPayload = z.infer<
  typeof zToBackendEditDraftChartRequestPayload
>;
export type ToBackendEditDraftChartRequest = z.infer<
  typeof zToBackendEditDraftChartRequest
>;
export type ToBackendEditDraftChartResponsePayload = z.infer<
  typeof zToBackendEditDraftChartResponsePayload
>;
export type ToBackendEditDraftChartResponse = z.infer<
  typeof zToBackendEditDraftChartResponse
>;
