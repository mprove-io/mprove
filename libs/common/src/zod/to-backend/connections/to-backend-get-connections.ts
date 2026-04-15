import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zProjectConnection } from '#common/zod/backend/project-connection';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetConnectionsRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string().nullish()
  })
  .meta({ id: 'ToBackendGetConnectionsRequestPayload' });

export let zToBackendGetConnectionsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetConnections)
  })
  .meta({ id: 'ToBackendGetConnectionsRequestInfo' });

export let zToBackendGetConnectionsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetConnectionsRequestInfo,
    payload: zToBackendGetConnectionsRequestPayload
  })
  .meta({ id: 'ToBackendGetConnectionsRequest' });

export let zToBackendGetConnectionsResponsePayload = z
  .object({
    userMember: zMember,
    connections: z.array(zProjectConnection)
  })
  .meta({ id: 'ToBackendGetConnectionsResponsePayload' });

export let zToBackendGetConnectionsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetConnections}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetConnectionsResponseInfo' });

export let zToBackendGetConnectionsResponse = zMyResponse
  .extend({
    info: zToBackendGetConnectionsResponseInfo,
    payload: zToBackendGetConnectionsResponsePayload
  })
  .meta({ id: 'ToBackendGetConnectionsResponse' });

export type ToBackendGetConnectionsRequestPayload = z.infer<
  typeof zToBackendGetConnectionsRequestPayload
>;
export type ToBackendGetConnectionsRequest = z.infer<
  typeof zToBackendGetConnectionsRequest
>;
export type ToBackendGetConnectionsResponsePayload = z.infer<
  typeof zToBackendGetConnectionsResponsePayload
>;
export type ToBackendGetConnectionsResponse = z.infer<
  typeof zToBackendGetConnectionsResponse
>;
