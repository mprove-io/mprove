import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProject } from '#common/zod/backend/project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetProjectInfoRequestPayload = z
  .object({
    projectId: z.string(),
    name: z.string().nullish()
  })
  .meta({ id: 'ToBackendSetProjectInfoRequestPayload' });

export let zToBackendSetProjectInfoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetProjectInfo)
  })
  .meta({ id: 'ToBackendSetProjectInfoRequestInfo' });

export let zToBackendSetProjectInfoRequest = zToBackendRequest
  .extend({
    info: zToBackendSetProjectInfoRequestInfo,
    payload: zToBackendSetProjectInfoRequestPayload
  })
  .meta({ id: 'ToBackendSetProjectInfoRequest' });

export let zToBackendSetProjectInfoResponsePayload = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectInfoResponsePayload' });

export let zToBackendSetProjectInfoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSetProjectInfo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetProjectInfoResponseInfo' });

export let zToBackendSetProjectInfoResponse = zMyResponse
  .extend({
    info: zToBackendSetProjectInfoResponseInfo,
    payload: zToBackendSetProjectInfoResponsePayload
  })
  .meta({ id: 'ToBackendSetProjectInfoResponse' });

export type ToBackendSetProjectInfoRequestPayload = z.infer<
  typeof zToBackendSetProjectInfoRequestPayload
>;
export type ToBackendSetProjectInfoRequest = z.infer<
  typeof zToBackendSetProjectInfoRequest
>;
export type ToBackendSetProjectInfoResponsePayload = z.infer<
  typeof zToBackendSetProjectInfoResponsePayload
>;
export type ToBackendSetProjectInfoResponse = z.infer<
  typeof zToBackendSetProjectInfoResponse
>;
