import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteDraftChartsRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendDeleteDraftChartsRequestPayload' });

export let zToBackendDeleteDraftChartsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteDraftCharts)
  })
  .meta({ id: 'ToBackendDeleteDraftChartsRequestInfo' });

export let zToBackendDeleteDraftChartsRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteDraftChartsRequestInfo,
    payload: zToBackendDeleteDraftChartsRequestPayload
  })
  .meta({ id: 'ToBackendDeleteDraftChartsRequest' });

export let zToBackendDeleteDraftChartsResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteDraftChartsResponsePayload' });

export let zToBackendDeleteDraftChartsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendDeleteDraftCharts}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteDraftChartsResponseInfo' });

export let zToBackendDeleteDraftChartsResponse = zMyResponse
  .extend({
    info: zToBackendDeleteDraftChartsResponseInfo,
    payload: zToBackendDeleteDraftChartsResponsePayload
  })
  .meta({ id: 'ToBackendDeleteDraftChartsResponse' });

export type ToBackendDeleteDraftChartsRequestPayload = z.infer<
  typeof zToBackendDeleteDraftChartsRequestPayload
>;
export type ToBackendDeleteDraftChartsRequest = z.infer<
  typeof zToBackendDeleteDraftChartsRequest
>;
export type ToBackendDeleteDraftChartsResponsePayload = z.infer<
  typeof zToBackendDeleteDraftChartsResponsePayload
>;
export type ToBackendDeleteDraftChartsResponse = z.infer<
  typeof zToBackendDeleteDraftChartsResponse
>;
