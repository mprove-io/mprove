import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetUserProfileRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendGetUserProfileRequestPayload' });

export let zToBackendGetUserProfileRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetUserProfile)
  })
  .meta({ id: 'ToBackendGetUserProfileRequestInfo' });

export let zToBackendGetUserProfileRequest = zToBackendRequest
  .extend({
    info: zToBackendGetUserProfileRequestInfo,
    payload: zToBackendGetUserProfileRequestPayload
  })
  .meta({ id: 'ToBackendGetUserProfileRequest' });

export let zToBackendGetUserProfileResponsePayload = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendGetUserProfileResponsePayload' });

export let zToBackendGetUserProfileResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetUserProfile}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetUserProfileResponseInfo' });

export let zToBackendGetUserProfileResponse = zMyResponse
  .extend({
    info: zToBackendGetUserProfileResponseInfo,
    payload: zToBackendGetUserProfileResponsePayload
  })
  .meta({ id: 'ToBackendGetUserProfileResponse' });

export type ToBackendGetUserProfileRequestPayload = z.infer<
  typeof zToBackendGetUserProfileRequestPayload
>;
export type ToBackendGetUserProfileRequest = z.infer<
  typeof zToBackendGetUserProfileRequest
>;
export type ToBackendGetUserProfileResponsePayload = z.infer<
  typeof zToBackendGetUserProfileResponsePayload
>;
export type ToBackendGetUserProfileResponse = z.infer<
  typeof zToBackendGetUserProfileResponse
>;
