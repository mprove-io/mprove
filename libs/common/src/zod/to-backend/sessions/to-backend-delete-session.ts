import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteSessionRequestPayload = z
  .object({
    sessionId: z.string()
  })
  .meta({ id: 'ToBackendDeleteSessionRequestPayload' });

export let zToBackendDeleteSessionRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteSession)
  })
  .meta({ id: 'ToBackendDeleteSessionRequestInfo' });

export let zToBackendDeleteSessionRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteSessionRequestInfo,
    payload: zToBackendDeleteSessionRequestPayload
  })
  .meta({ id: 'ToBackendDeleteSessionRequest' });

export let zToBackendDeleteSessionResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteSessionResponsePayload' });

export let zToBackendDeleteSessionResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteSession}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteSessionResponseInfo' });

export let zToBackendDeleteSessionResponse = zMyResponse
  .extend({
    info: zToBackendDeleteSessionResponseInfo,
    payload: zToBackendDeleteSessionResponsePayload
  })
  .meta({ id: 'ToBackendDeleteSessionResponse' });

export type ToBackendDeleteSessionRequestPayload = z.infer<
  typeof zToBackendDeleteSessionRequestPayload
>;
export type ToBackendDeleteSessionRequest = z.infer<
  typeof zToBackendDeleteSessionRequest
>;
export type ToBackendDeleteSessionResponsePayload = z.infer<
  typeof zToBackendDeleteSessionResponsePayload
>;
export type ToBackendDeleteSessionResponse = z.infer<
  typeof zToBackendDeleteSessionResponse
>;
