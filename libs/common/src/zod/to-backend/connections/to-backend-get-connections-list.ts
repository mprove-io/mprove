import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zConnectionItem } from '#common/zod/to-backend/connections/connection-item';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetConnectionsListRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetConnectionsListRequestPayload' });

export let zToBackendGetConnectionsListRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetConnectionsList)
  })
  .meta({ id: 'ToBackendGetConnectionsListRequestInfo' });

export let zToBackendGetConnectionsListRequest = zToBackendRequest
  .extend({
    info: zToBackendGetConnectionsListRequestInfo,
    payload: zToBackendGetConnectionsListRequestPayload
  })
  .meta({ id: 'ToBackendGetConnectionsListRequest' });

export let zToBackendGetConnectionsListResponsePayload = z
  .object({
    connectionItems: z.array(zConnectionItem)
  })
  .meta({ id: 'ToBackendGetConnectionsListResponsePayload' });

export let zToBackendGetConnectionsListResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetConnectionsList}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetConnectionsListResponseInfo' });

export let zToBackendGetConnectionsListResponse = zMyResponse
  .extend({
    info: zToBackendGetConnectionsListResponseInfo,
    payload: zToBackendGetConnectionsListResponsePayload
  })
  .meta({ id: 'ToBackendGetConnectionsListResponse' });

export type ToBackendGetConnectionsListRequestPayload = z.infer<
  typeof zToBackendGetConnectionsListRequestPayload
>;
export type ToBackendGetConnectionsListRequest = z.infer<
  typeof zToBackendGetConnectionsListRequest
>;
export type ToBackendGetConnectionsListResponsePayload = z.infer<
  typeof zToBackendGetConnectionsListResponsePayload
>;
export type ToBackendGetConnectionsListResponse = z.infer<
  typeof zToBackendGetConnectionsListResponse
>;
