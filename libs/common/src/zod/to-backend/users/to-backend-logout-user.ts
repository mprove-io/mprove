import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendLogoutUserRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendLogoutUserRequestPayload' });

export let zToBackendLogoutUserRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendLogoutUser)
  })
  .meta({ id: 'ToBackendLogoutUserRequestInfo' });

export let zToBackendLogoutUserRequest = zToBackendRequest
  .extend({
    info: zToBackendLogoutUserRequestInfo,
    payload: zToBackendLogoutUserRequestPayload
  })
  .meta({ id: 'ToBackendLogoutUserRequest' });

export let zToBackendLogoutUserResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendLogoutUserResponsePayload' });

export let zToBackendLogoutUserResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendLogoutUser}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendLogoutUserResponseInfo' });

export let zToBackendLogoutUserResponse = zMyResponse
  .extend({
    info: zToBackendLogoutUserResponseInfo,
    payload: zToBackendLogoutUserResponsePayload
  })
  .meta({ id: 'ToBackendLogoutUserResponse' });

export type ToBackendLogoutUserRequestPayload = z.infer<
  typeof zToBackendLogoutUserRequestPayload
>;
export type ToBackendLogoutUserRequest = z.infer<
  typeof zToBackendLogoutUserRequest
>;
export type ToBackendLogoutUserResponsePayload = z.infer<
  typeof zToBackendLogoutUserResponsePayload
>;
export type ToBackendLogoutUserResponse = z.infer<
  typeof zToBackendLogoutUserResponse
>;
