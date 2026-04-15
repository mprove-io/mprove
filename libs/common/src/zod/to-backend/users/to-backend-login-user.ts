import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendLoginUserRequestPayload = z
  .object({
    email: z.string(),
    password: z.string()
  })
  .meta({ id: 'ToBackendLoginUserRequestPayload' });

export let zToBackendLoginUserRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendLoginUser)
  })
  .meta({ id: 'ToBackendLoginUserRequestInfo' });

export let zToBackendLoginUserRequest = zToBackendRequest
  .extend({
    info: zToBackendLoginUserRequestInfo,
    payload: zToBackendLoginUserRequestPayload
  })
  .meta({ id: 'ToBackendLoginUserRequest' });

export let zToBackendLoginUserResponsePayload = z
  .object({
    token: z.string(),
    user: zUser
  })
  .meta({ id: 'ToBackendLoginUserResponsePayload' });

export let zToBackendLoginUserResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendLoginUser}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendLoginUserResponseInfo' });

export let zToBackendLoginUserResponse = zMyResponse
  .extend({
    info: zToBackendLoginUserResponseInfo,
    payload: zToBackendLoginUserResponsePayload
  })
  .meta({ id: 'ToBackendLoginUserResponse' });

export type ToBackendLoginUserRequestPayload = z.infer<
  typeof zToBackendLoginUserRequestPayload
>;
export type ToBackendLoginUserRequest = z.infer<
  typeof zToBackendLoginUserRequest
>;
export type ToBackendLoginUserResponsePayload = z.infer<
  typeof zToBackendLoginUserResponsePayload
>;
export type ToBackendLoginUserResponse = z.infer<
  typeof zToBackendLoginUserResponse
>;
