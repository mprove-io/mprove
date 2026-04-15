import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetSessionTitleRequestPayload = z
  .object({
    sessionId: z.string(),
    title: z.string()
  })
  .meta({ id: 'ToBackendSetSessionTitleRequestPayload' });

export let zToBackendSetSessionTitleRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetSessionTitle)
  })
  .meta({ id: 'ToBackendSetSessionTitleRequestInfo' });

export let zToBackendSetSessionTitleRequest = zToBackendRequest
  .extend({
    info: zToBackendSetSessionTitleRequestInfo,
    payload: zToBackendSetSessionTitleRequestPayload
  })
  .meta({ id: 'ToBackendSetSessionTitleRequest' });

export let zToBackendSetSessionTitleResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendSetSessionTitleResponsePayload' });

export let zToBackendSetSessionTitleResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSetSessionTitle}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetSessionTitleResponseInfo' });

export let zToBackendSetSessionTitleResponse = zMyResponse
  .extend({
    info: zToBackendSetSessionTitleResponseInfo,
    payload: zToBackendSetSessionTitleResponsePayload
  })
  .meta({ id: 'ToBackendSetSessionTitleResponse' });

export type ToBackendSetSessionTitleRequestPayload = z.infer<
  typeof zToBackendSetSessionTitleRequestPayload
>;
export type ToBackendSetSessionTitleRequest = z.infer<
  typeof zToBackendSetSessionTitleRequest
>;
export type ToBackendSetSessionTitleResponsePayload = z.infer<
  typeof zToBackendSetSessionTitleResponsePayload
>;
export type ToBackendSetSessionTitleResponse = z.infer<
  typeof zToBackendSetSessionTitleResponse
>;
