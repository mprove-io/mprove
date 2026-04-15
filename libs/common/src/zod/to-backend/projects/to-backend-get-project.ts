import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zProject } from '#common/zod/backend/project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetProjectRequestPayload = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetProjectRequestPayload' });

export let zToBackendGetProjectRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetProject)
  })
  .meta({ id: 'ToBackendGetProjectRequestInfo' });

export let zToBackendGetProjectRequest = zToBackendRequest
  .extend({
    info: zToBackendGetProjectRequestInfo,
    payload: zToBackendGetProjectRequestPayload
  })
  .meta({ id: 'ToBackendGetProjectRequest' });

export let zToBackendGetProjectResponsePayload = z
  .object({
    project: zProject,
    userMember: zMember
  })
  .meta({ id: 'ToBackendGetProjectResponsePayload' });

export let zToBackendGetProjectResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetProject}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetProjectResponseInfo' });

export let zToBackendGetProjectResponse = zMyResponse
  .extend({
    info: zToBackendGetProjectResponseInfo,
    payload: zToBackendGetProjectResponsePayload
  })
  .meta({ id: 'ToBackendGetProjectResponse' });

export type ToBackendGetProjectRequestPayload = z.infer<
  typeof zToBackendGetProjectRequestPayload
>;
export type ToBackendGetProjectRequest = z.infer<
  typeof zToBackendGetProjectRequest
>;
export type ToBackendGetProjectResponsePayload = z.infer<
  typeof zToBackendGetProjectResponsePayload
>;
export type ToBackendGetProjectResponse = z.infer<
  typeof zToBackendGetProjectResponse
>;
