import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendRegisterUserRequestPayload = z
  .object({
    email: z.string(),
    password: z.string()
  })
  .meta({ id: 'ToBackendRegisterUserRequestPayload' });

export let zToBackendRegisterUserRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendRegisterUser)
  })
  .meta({ id: 'ToBackendRegisterUserRequestInfo' });

export let zToBackendRegisterUserRequest = zToBackendRequest
  .extend({
    info: zToBackendRegisterUserRequestInfo,
    payload: zToBackendRegisterUserRequestPayload
  })
  .meta({ id: 'ToBackendRegisterUserRequest' });

export let zToBackendRegisterUserResponsePayload = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendRegisterUserResponsePayload' });

export let zToBackendRegisterUserResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendRegisterUser}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendRegisterUserResponseInfo' });

export let zToBackendRegisterUserResponse = zMyResponse
  .extend({
    info: zToBackendRegisterUserResponseInfo,
    payload: zToBackendRegisterUserResponsePayload
  })
  .meta({ id: 'ToBackendRegisterUserResponse' });

export type ToBackendRegisterUserRequestPayload = z.infer<
  typeof zToBackendRegisterUserRequestPayload
>;
export type ToBackendRegisterUserRequest = z.infer<
  typeof zToBackendRegisterUserRequest
>;
export type ToBackendRegisterUserResponsePayload = z.infer<
  typeof zToBackendRegisterUserResponsePayload
>;
export type ToBackendRegisterUserResponse = z.infer<
  typeof zToBackendRegisterUserResponse
>;
