import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zChartX } from '#common/zod/backend/chart-x';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetChartRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartId: z.string(),
    timezone: z.string()
  })
  .meta({ id: 'ToBackendGetChartRequestPayload' });

export let zToBackendGetChartRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetChart)
  })
  .meta({ id: 'ToBackendGetChartRequestInfo' });

export let zToBackendGetChartRequest = zToBackendRequest
  .extend({
    info: zToBackendGetChartRequestInfo,
    payload: zToBackendGetChartRequestPayload
  })
  .meta({ id: 'ToBackendGetChartRequest' });

export let zToBackendGetChartResponsePayload = z
  .object({
    userMember: zMember,
    chart: zChartX
  })
  .meta({ id: 'ToBackendGetChartResponsePayload' });

export let zToBackendGetChartResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetChart}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetChartResponseInfo' });

export let zToBackendGetChartResponse = zMyResponse
  .extend({
    info: zToBackendGetChartResponseInfo,
    payload: zToBackendGetChartResponsePayload
  })
  .meta({ id: 'ToBackendGetChartResponse' });

export type ToBackendGetChartRequestPayload = z.infer<
  typeof zToBackendGetChartRequestPayload
>;
export type ToBackendGetChartRequest = z.infer<
  typeof zToBackendGetChartRequest
>;
export type ToBackendGetChartResponsePayload = z.infer<
  typeof zToBackendGetChartResponsePayload
>;
export type ToBackendGetChartResponse = z.infer<
  typeof zToBackendGetChartResponse
>;
