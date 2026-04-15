import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCheckLastNavRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    modelId: z.string().nullish(),
    chartId: z.string().nullish(),
    dashboardId: z.string().nullish(),
    reportId: z.string().nullish()
  })
  .meta({ id: 'ToBackendCheckLastNavRequestPayload' });

export let zToBackendCheckLastNavRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCheckLastNav)
  })
  .meta({ id: 'ToBackendCheckLastNavRequestInfo' });

export let zToBackendCheckLastNavRequest = zToBackendRequest
  .extend({
    info: zToBackendCheckLastNavRequestInfo,
    payload: zToBackendCheckLastNavRequestPayload
  })
  .meta({ id: 'ToBackendCheckLastNavRequest' });

export let zToBackendCheckLastNavResponsePayload = z
  .object({
    modelExists: z.boolean(),
    chartExists: z.boolean(),
    dashboardExists: z.boolean(),
    reportExists: z.boolean()
  })
  .meta({ id: 'ToBackendCheckLastNavResponsePayload' });

export let zToBackendCheckLastNavResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCheckLastNav}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCheckLastNavResponseInfo' });

export let zToBackendCheckLastNavResponse = zMyResponse
  .extend({
    info: zToBackendCheckLastNavResponseInfo,
    payload: zToBackendCheckLastNavResponsePayload
  })
  .meta({ id: 'ToBackendCheckLastNavResponse' });

export type ToBackendCheckLastNavRequestPayload = z.infer<
  typeof zToBackendCheckLastNavRequestPayload
>;
export type ToBackendCheckLastNavRequest = z.infer<
  typeof zToBackendCheckLastNavRequest
>;
export type ToBackendCheckLastNavResponsePayload = z.infer<
  typeof zToBackendCheckLastNavResponsePayload
>;
export type ToBackendCheckLastNavResponse = z.infer<
  typeof zToBackendCheckLastNavResponse
>;
