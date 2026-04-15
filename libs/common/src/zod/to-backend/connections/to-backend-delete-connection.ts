import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteConnectionRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string()
  })
  .meta({ id: 'ToBackendDeleteConnectionRequestPayload' });

export let zToBackendDeleteConnectionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteConnection)
  })
  .meta({ id: 'ToBackendDeleteConnectionRequestInfo' });

export let zToBackendDeleteConnectionRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteConnectionRequestInfo,
    payload: zToBackendDeleteConnectionRequestPayload
  })
  .meta({ id: 'ToBackendDeleteConnectionRequest' });

export let zToBackendDeleteConnectionResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteConnectionResponsePayload' });

export let zToBackendDeleteConnectionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendDeleteConnection}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteConnectionResponseInfo' });

export let zToBackendDeleteConnectionResponse = zMyResponse
  .extend({
    info: zToBackendDeleteConnectionResponseInfo,
    payload: zToBackendDeleteConnectionResponsePayload
  })
  .meta({ id: 'ToBackendDeleteConnectionResponse' });

export type ToBackendDeleteConnectionRequestPayload = z.infer<
  typeof zToBackendDeleteConnectionRequestPayload
>;
export type ToBackendDeleteConnectionRequest = z.infer<
  typeof zToBackendDeleteConnectionRequest
>;
export type ToBackendDeleteConnectionResponsePayload = z.infer<
  typeof zToBackendDeleteConnectionResponsePayload
>;
export type ToBackendDeleteConnectionResponse = z.infer<
  typeof zToBackendDeleteConnectionResponse
>;
