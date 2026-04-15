import { z } from 'zod';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProject } from '#common/zod/backend/project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateProjectRequestPayload = z
  .object({
    orgId: z.string(),
    name: z.string(),
    remoteType: z.enum(ProjectRemoteTypeEnum),
    gitUrl: z.string().nullish(),
    noteId: z.string().nullish()
  })
  .meta({ id: 'ToBackendCreateProjectRequestPayload' });

export let zToBackendCreateProjectRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateProject)
  })
  .meta({ id: 'ToBackendCreateProjectRequestInfo' });

export let zToBackendCreateProjectRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateProjectRequestInfo,
    payload: zToBackendCreateProjectRequestPayload
  })
  .meta({ id: 'ToBackendCreateProjectRequest' });

export let zToBackendCreateProjectResponsePayload = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendCreateProjectResponsePayload' });

export let zToBackendCreateProjectResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateProject}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateProjectResponseInfo' });

export let zToBackendCreateProjectResponse = zMyResponse
  .extend({
    info: zToBackendCreateProjectResponseInfo,
    payload: zToBackendCreateProjectResponsePayload
  })
  .meta({ id: 'ToBackendCreateProjectResponse' });

export type ToBackendCreateProjectRequestPayload = z.infer<
  typeof zToBackendCreateProjectRequestPayload
>;
export type ToBackendCreateProjectRequest = z.infer<
  typeof zToBackendCreateProjectRequest
>;
export type ToBackendCreateProjectResponsePayload = z.infer<
  typeof zToBackendCreateProjectResponsePayload
>;
export type ToBackendCreateProjectResponse = z.infer<
  typeof zToBackendCreateProjectResponse
>;
