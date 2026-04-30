import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zChartX } from '#common/zod/backend/chart-x';
import { zMconfigX } from '#common/zod/backend/mconfig-x';
import { zBmlError } from '#common/zod/blockml/bml-error';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendOpenExplorerChartTabRequestPayload = z
  .object({
    sessionId: z.string(),
    chartId: z.string()
  })
  .meta({ id: 'ToBackendOpenExplorerChartTabRequestPayload' });

export let zToBackendOpenExplorerChartTabRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendOpenExplorerChartTab)
  })
  .meta({ id: 'ToBackendOpenExplorerChartTabRequestInfo' });

export let zToBackendOpenExplorerChartTabRequest = zToBackendRequest
  .extend({
    info: zToBackendOpenExplorerChartTabRequestInfo,
    payload: zToBackendOpenExplorerChartTabRequestPayload
  })
  .meta({ id: 'ToBackendOpenExplorerChartTabRequest' });

export let zToBackendOpenExplorerChartTabResponsePayload = z
  .discriminatedUnion('status', [
    z.object({
      status: z.literal('ok'),
      chart: zChartX,
      mconfig: zMconfigX,
      query: zQuery
    }),
    z.object({
      status: z.literal('error'),
      errors: z.array(zBmlError)
    })
  ])
  .meta({ id: 'ToBackendOpenExplorerChartTabResponsePayload' });

export let zToBackendOpenExplorerChartTabResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendOpenExplorerChartTab}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendOpenExplorerChartTabResponseInfo' });

export let zToBackendOpenExplorerChartTabResponse = zMyResponse
  .extend({
    info: zToBackendOpenExplorerChartTabResponseInfo,
    payload: zToBackendOpenExplorerChartTabResponsePayload
  })
  .meta({ id: 'ToBackendOpenExplorerChartTabResponse' });

export type ToBackendOpenExplorerChartTabRequestPayload = z.infer<
  typeof zToBackendOpenExplorerChartTabRequestPayload
>;
export type ToBackendOpenExplorerChartTabRequest = z.infer<
  typeof zToBackendOpenExplorerChartTabRequest
>;
export type ToBackendOpenExplorerChartTabResponsePayload = z.infer<
  typeof zToBackendOpenExplorerChartTabResponsePayload
>;
export type ToBackendOpenExplorerChartTabResponse = z.infer<
  typeof zToBackendOpenExplorerChartTabResponse
>;
