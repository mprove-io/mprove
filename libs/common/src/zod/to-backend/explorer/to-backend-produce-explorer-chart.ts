import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zBmlError } from '#common/zod/blockml/bml-error';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendProduceExplorerChartRequestPayload = z
  .object({
    sessionId: z.string(),
    chartId: z.string(),
    modelId: z.string(),
    chartYaml: z.string(),
    title: z.string()
  })
  .meta({ id: 'ToBackendProduceExplorerChartRequestPayload' });

export let zToBackendProduceExplorerChartRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendProduceExplorerChart)
  })
  .meta({ id: 'ToBackendProduceExplorerChartRequestInfo' });

export let zToBackendProduceExplorerChartRequest = zToBackendRequest
  .extend({
    info: zToBackendProduceExplorerChartRequestInfo,
    payload: zToBackendProduceExplorerChartRequestPayload
  })
  .meta({ id: 'ToBackendProduceExplorerChartRequest' });

export let zToBackendProduceExplorerChartResponsePayload = z
  .discriminatedUnion('status', [
    z.object({
      status: z.literal('ok'),
      tabId: z.string(),
      chartId: z.string(),
      title: z.string()
    }),
    z.object({
      status: z.literal('error'),
      errors: z.array(zBmlError)
    })
  ])
  .meta({ id: 'ToBackendProduceExplorerChartResponsePayload' });

export let zToBackendProduceExplorerChartResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendProduceExplorerChart}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendProduceExplorerChartResponseInfo' });

export let zToBackendProduceExplorerChartResponse = zMyResponse
  .extend({
    info: zToBackendProduceExplorerChartResponseInfo,
    payload: zToBackendProduceExplorerChartResponsePayload
  })
  .meta({ id: 'ToBackendProduceExplorerChartResponse' });

export type ToBackendProduceExplorerChartRequestPayload = z.infer<
  typeof zToBackendProduceExplorerChartRequestPayload
>;
export type ToBackendProduceExplorerChartRequest = z.infer<
  typeof zToBackendProduceExplorerChartRequest
>;
export type ToBackendProduceExplorerChartResponsePayload = z.infer<
  typeof zToBackendProduceExplorerChartResponsePayload
>;
export type ToBackendProduceExplorerChartResponse = z.infer<
  typeof zToBackendProduceExplorerChartResponse
>;
