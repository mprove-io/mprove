import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteProjectRequestPayload = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendDeleteProjectRequestPayload' });

export let zToBackendDeleteProjectRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteProject)
  })
  .meta({ id: 'ToBackendDeleteProjectRequestInfo' });

export let zToBackendDeleteProjectRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteProjectRequestInfo,
    payload: zToBackendDeleteProjectRequestPayload
  })
  .meta({ id: 'ToBackendDeleteProjectRequest' });

export let zToBackendDeleteProjectResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteProjectResponsePayload' });

export let zToBackendDeleteProjectResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteProject}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteProjectResponseInfo' });

export let zToBackendDeleteProjectResponse = zMyResponse
  .extend({
    info: zToBackendDeleteProjectResponseInfo,
    payload: zToBackendDeleteProjectResponsePayload
  })
  .meta({ id: 'ToBackendDeleteProjectResponse' });

export type ToBackendDeleteProjectRequestPayload = z.infer<
  typeof zToBackendDeleteProjectRequestPayload
>;
export type ToBackendDeleteProjectRequest = z.infer<
  typeof zToBackendDeleteProjectRequest
>;
export type ToBackendDeleteProjectResponsePayload = z.infer<
  typeof zToBackendDeleteProjectResponsePayload
>;
export type ToBackendDeleteProjectResponse = z.infer<
  typeof zToBackendDeleteProjectResponse
>;
