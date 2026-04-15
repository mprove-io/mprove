import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMconfigX } from '#common/zod/backend/mconfig-x';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSuggestDimensionValuesRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    structId: z.string(),
    modelId: z.string(),
    fieldId: z.string(),
    chartId: z.string().nullish(),
    dashboardId: z.string().nullish(),
    reportId: z.string().nullish(),
    rowId: z.string().nullish(),
    term: z.string().nullish(),
    cellMetricsStartDateMs: z.number().nullish(),
    cellMetricsEndDateMs: z.number().nullish()
  })
  .meta({ id: 'ToBackendSuggestDimensionValuesRequestPayload' });

export let zToBackendSuggestDimensionValuesRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendSuggestDimensionValues
    )
  })
  .meta({ id: 'ToBackendSuggestDimensionValuesRequestInfo' });

export let zToBackendSuggestDimensionValuesRequest = zToBackendRequest
  .extend({
    info: zToBackendSuggestDimensionValuesRequestInfo,
    payload: zToBackendSuggestDimensionValuesRequestPayload
  })
  .meta({ id: 'ToBackendSuggestDimensionValuesRequest' });

export let zToBackendSuggestDimensionValuesResponsePayload = z
  .object({
    mconfig: zMconfigX,
    query: zQuery
  })
  .meta({ id: 'ToBackendSuggestDimensionValuesResponsePayload' });

export let zToBackendSuggestDimensionValuesResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSuggestDimensionValues}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSuggestDimensionValuesResponseInfo' });

export let zToBackendSuggestDimensionValuesResponse = zMyResponse
  .extend({
    info: zToBackendSuggestDimensionValuesResponseInfo,
    payload: zToBackendSuggestDimensionValuesResponsePayload
  })
  .meta({ id: 'ToBackendSuggestDimensionValuesResponse' });

export type ToBackendSuggestDimensionValuesRequestPayload = z.infer<
  typeof zToBackendSuggestDimensionValuesRequestPayload
>;
export type ToBackendSuggestDimensionValuesRequest = z.infer<
  typeof zToBackendSuggestDimensionValuesRequest
>;
export type ToBackendSuggestDimensionValuesResponsePayload = z.infer<
  typeof zToBackendSuggestDimensionValuesResponsePayload
>;
export type ToBackendSuggestDimensionValuesResponse = z.infer<
  typeof zToBackendSuggestDimensionValuesResponse
>;
