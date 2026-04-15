import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteUserRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserRequestPayload' });

export let zToBackendDeleteUserRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteUser)
  })
  .meta({ id: 'ToBackendDeleteUserRequestInfo' });

export let zToBackendDeleteUserRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteUserRequestInfo,
    payload: zToBackendDeleteUserRequestPayload
  })
  .meta({ id: 'ToBackendDeleteUserRequest' });

export let zToBackendDeleteUserResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserResponsePayload' });

export let zToBackendDeleteUserResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteUser}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteUserResponseInfo' });

export let zToBackendDeleteUserResponse = zMyResponse
  .extend({
    info: zToBackendDeleteUserResponseInfo,
    payload: zToBackendDeleteUserResponsePayload
  })
  .meta({ id: 'ToBackendDeleteUserResponse' });

export type ToBackendDeleteUserRequestPayload = z.infer<
  typeof zToBackendDeleteUserRequestPayload
>;
export type ToBackendDeleteUserRequest = z.infer<
  typeof zToBackendDeleteUserRequest
>;
export type ToBackendDeleteUserResponsePayload = z.infer<
  typeof zToBackendDeleteUserResponsePayload
>;
export type ToBackendDeleteUserResponse = z.infer<
  typeof zToBackendDeleteUserResponse
>;
