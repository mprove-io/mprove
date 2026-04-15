import { z } from 'zod';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProject } from '#common/zod/backend/project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetProjectWeekStartRequestPayload = z
  .object({
    projectId: z.string(),
    weekStart: z.enum(ProjectWeekStartEnum)
  })
  .meta({ id: 'ToBackendSetProjectWeekStartRequestPayload' });

export let zToBackendSetProjectWeekStartRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetProjectWeekStart)
  })
  .meta({ id: 'ToBackendSetProjectWeekStartRequestInfo' });

export let zToBackendSetProjectWeekStartRequest = zToBackendRequest
  .extend({
    info: zToBackendSetProjectWeekStartRequestInfo,
    payload: zToBackendSetProjectWeekStartRequestPayload
  })
  .meta({ id: 'ToBackendSetProjectWeekStartRequest' });

export let zToBackendSetProjectWeekStartResponsePayload = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectWeekStartResponsePayload' });

export let zToBackendSetProjectWeekStartResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSetProjectWeekStart}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetProjectWeekStartResponseInfo' });

export let zToBackendSetProjectWeekStartResponse = zMyResponse
  .extend({
    info: zToBackendSetProjectWeekStartResponseInfo,
    payload: zToBackendSetProjectWeekStartResponsePayload
  })
  .meta({ id: 'ToBackendSetProjectWeekStartResponse' });

export type ToBackendSetProjectWeekStartRequestPayload = z.infer<
  typeof zToBackendSetProjectWeekStartRequestPayload
>;
export type ToBackendSetProjectWeekStartRequest = z.infer<
  typeof zToBackendSetProjectWeekStartRequest
>;
export type ToBackendSetProjectWeekStartResponsePayload = z.infer<
  typeof zToBackendSetProjectWeekStartResponsePayload
>;
export type ToBackendSetProjectWeekStartResponse = z.infer<
  typeof zToBackendSetProjectWeekStartResponse
>;
