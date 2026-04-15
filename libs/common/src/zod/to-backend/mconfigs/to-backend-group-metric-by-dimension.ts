import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMconfigX } from '#common/zod/backend/mconfig-x';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGroupMetricByDimensionRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    timezone: z.string(),
    mconfigId: z.string(),
    groupByFieldId: z.string(),
    cellMetricsStartDateMs: z.number().nullish(),
    cellMetricsEndDateMs: z.number().nullish()
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionRequestPayload' });

export let zToBackendGroupMetricByDimensionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendGroupMetricByDimension
    )
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionRequestInfo' });

export let zToBackendGroupMetricByDimensionRequest = zToBackendRequest
  .extend({
    info: zToBackendGroupMetricByDimensionRequestInfo,
    payload: zToBackendGroupMetricByDimensionRequestPayload
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionRequest' });

export let zToBackendGroupMetricByDimensionResponsePayload = z
  .object({
    mconfig: zMconfigX,
    query: zQuery
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionResponsePayload' });

export let zToBackendGroupMetricByDimensionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGroupMetricByDimension}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionResponseInfo' });

export let zToBackendGroupMetricByDimensionResponse = zMyResponse
  .extend({
    info: zToBackendGroupMetricByDimensionResponseInfo,
    payload: zToBackendGroupMetricByDimensionResponsePayload
  })
  .meta({ id: 'ToBackendGroupMetricByDimensionResponse' });

export type ToBackendGroupMetricByDimensionRequestPayload = z.infer<
  typeof zToBackendGroupMetricByDimensionRequestPayload
>;
export type ToBackendGroupMetricByDimensionRequest = z.infer<
  typeof zToBackendGroupMetricByDimensionRequest
>;
export type ToBackendGroupMetricByDimensionResponsePayload = z.infer<
  typeof zToBackendGroupMetricByDimensionResponsePayload
>;
export type ToBackendGroupMetricByDimensionResponse = z.infer<
  typeof zToBackendGroupMetricByDimensionResponse
>;
