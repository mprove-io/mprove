import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteChartRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartId: z.string()
  })
  .meta({ id: 'ToBackendDeleteChartRequestPayload' });

export let zToBackendDeleteChartRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteChart)
  })
  .meta({ id: 'ToBackendDeleteChartRequestInfo' });

export let zToBackendDeleteChartRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteChartRequestInfo,
    payload: zToBackendDeleteChartRequestPayload
  })
  .meta({ id: 'ToBackendDeleteChartRequest' });

export let zToBackendDeleteChartResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteChartResponsePayload' });

export let zToBackendDeleteChartResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteChart}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteChartResponseInfo' });

export let zToBackendDeleteChartResponse = zMyResponse
  .extend({
    info: zToBackendDeleteChartResponseInfo,
    payload: zToBackendDeleteChartResponsePayload
  })
  .meta({ id: 'ToBackendDeleteChartResponse' });

export type ToBackendDeleteChartRequestPayload = z.infer<
  typeof zToBackendDeleteChartRequestPayload
>;
export type ToBackendDeleteChartRequest = z.infer<
  typeof zToBackendDeleteChartRequest
>;
export type ToBackendDeleteChartResponsePayload = z.infer<
  typeof zToBackendDeleteChartResponsePayload
>;
export type ToBackendDeleteChartResponse = z.infer<
  typeof zToBackendDeleteChartResponse
>;
