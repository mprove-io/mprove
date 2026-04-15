import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zChartX } from '#common/zod/backend/chart-x';
import { zMember } from '#common/zod/backend/member';
import { zModelX } from '#common/zod/backend/model-x';
import { zStructX } from '#common/zod/backend/struct-x';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetChartsRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetChartsRequestPayload' });

export let zToBackendGetChartsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetCharts)
  })
  .meta({ id: 'ToBackendGetChartsRequestInfo' });

export let zToBackendGetChartsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetChartsRequestInfo,
    payload: zToBackendGetChartsRequestPayload
  })
  .meta({ id: 'ToBackendGetChartsRequest' });

export let zToBackendGetChartsResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    models: z.array(zModelX),
    charts: z.array(zChartX)
  })
  .meta({ id: 'ToBackendGetChartsResponsePayload' });

export let zToBackendGetChartsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetCharts}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetChartsResponseInfo' });

export let zToBackendGetChartsResponse = zMyResponse
  .extend({
    info: zToBackendGetChartsResponseInfo,
    payload: zToBackendGetChartsResponsePayload
  })
  .meta({ id: 'ToBackendGetChartsResponse' });

export type ToBackendGetChartsRequestPayload = z.infer<
  typeof zToBackendGetChartsRequestPayload
>;
export type ToBackendGetChartsRequest = z.infer<
  typeof zToBackendGetChartsRequest
>;
export type ToBackendGetChartsResponsePayload = z.infer<
  typeof zToBackendGetChartsResponsePayload
>;
export type ToBackendGetChartsResponse = z.infer<
  typeof zToBackendGetChartsResponse
>;
