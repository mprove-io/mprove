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

export let zToBackendGetExplorerChartTabRequestPayload = z
  .object({
    sessionId: z.string(),
    chartId: z.string()
  })
  .meta({ id: 'ToBackendGetExplorerChartTabRequestPayload' });

export let zToBackendGetExplorerChartTabRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetExplorerChartTab)
  })
  .meta({ id: 'ToBackendGetExplorerChartTabRequestInfo' });

export let zToBackendGetExplorerChartTabRequest = zToBackendRequest
  .extend({
    info: zToBackendGetExplorerChartTabRequestInfo,
    payload: zToBackendGetExplorerChartTabRequestPayload
  })
  .meta({ id: 'ToBackendGetExplorerChartTabRequest' });

export let zToBackendGetExplorerChartTabResponsePayload = z
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
  .meta({ id: 'ToBackendGetExplorerChartTabResponsePayload' });

export let zToBackendGetExplorerChartTabResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetExplorerChartTab}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetExplorerChartTabResponseInfo' });

export let zToBackendGetExplorerChartTabResponse = zMyResponse
  .extend({
    info: zToBackendGetExplorerChartTabResponseInfo,
    payload: zToBackendGetExplorerChartTabResponsePayload
  })
  .meta({ id: 'ToBackendGetExplorerChartTabResponse' });

export type ToBackendGetExplorerChartTabRequestPayload = z.infer<
  typeof zToBackendGetExplorerChartTabRequestPayload
>;
export type ToBackendGetExplorerChartTabRequest = z.infer<
  typeof zToBackendGetExplorerChartTabRequest
>;
export type ToBackendGetExplorerChartTabResponsePayload = z.infer<
  typeof zToBackendGetExplorerChartTabResponsePayload
>;
export type ToBackendGetExplorerChartTabResponse = z.infer<
  typeof zToBackendGetExplorerChartTabResponse
>;
