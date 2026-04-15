import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProjectsItem } from '#common/zod/backend/projects-item';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetProjectsListRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToBackendGetProjectsListRequestPayload' });

export let zToBackendGetProjectsListRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetProjectsList)
  })
  .meta({ id: 'ToBackendGetProjectsListRequestInfo' });

export let zToBackendGetProjectsListRequest = zToBackendRequest
  .extend({
    info: zToBackendGetProjectsListRequestInfo,
    payload: zToBackendGetProjectsListRequestPayload
  })
  .meta({ id: 'ToBackendGetProjectsListRequest' });

export let zToBackendGetProjectsListResponsePayload = z
  .object({
    projectsList: z.array(zProjectsItem)
  })
  .meta({ id: 'ToBackendGetProjectsListResponsePayload' });

export let zToBackendGetProjectsListResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetProjectsList}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetProjectsListResponseInfo' });

export let zToBackendGetProjectsListResponse = zMyResponse
  .extend({
    info: zToBackendGetProjectsListResponseInfo,
    payload: zToBackendGetProjectsListResponsePayload
  })
  .meta({ id: 'ToBackendGetProjectsListResponse' });

export type ToBackendGetProjectsListRequestPayload = z.infer<
  typeof zToBackendGetProjectsListRequestPayload
>;
export type ToBackendGetProjectsListRequest = z.infer<
  typeof zToBackendGetProjectsListRequest
>;
export type ToBackendGetProjectsListResponsePayload = z.infer<
  typeof zToBackendGetProjectsListResponsePayload
>;
export type ToBackendGetProjectsListResponse = z.infer<
  typeof zToBackendGetProjectsListResponse
>;
