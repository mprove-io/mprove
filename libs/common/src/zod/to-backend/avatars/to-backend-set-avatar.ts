import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetAvatarRequestPayload = z
  .object({
    avatarBig: z.string().nullish(),
    avatarSmall: z.string()
  })
  .meta({ id: 'ToBackendSetAvatarRequestPayload' });

export let zToBackendSetAvatarRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetAvatar)
  })
  .meta({ id: 'ToBackendSetAvatarRequestInfo' });

export let zToBackendSetAvatarRequest = zToBackendRequest
  .extend({
    info: zToBackendSetAvatarRequestInfo,
    payload: zToBackendSetAvatarRequestPayload
  })
  .meta({ id: 'ToBackendSetAvatarRequest' });

export let zToBackendSetAvatarResponsePayload = z
  .object({
    avatarSmall: z.string(),
    avatarBig: z.string()
  })
  .meta({ id: 'ToBackendSetAvatarResponsePayload' });

export let zToBackendSetAvatarResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSetAvatar}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetAvatarResponseInfo' });

export let zToBackendSetAvatarResponse = zMyResponse
  .extend({
    info: zToBackendSetAvatarResponseInfo,
    payload: zToBackendSetAvatarResponsePayload
  })
  .meta({ id: 'ToBackendSetAvatarResponse' });

export type ToBackendSetAvatarRequestPayload = z.infer<
  typeof zToBackendSetAvatarRequestPayload
>;
export type ToBackendSetAvatarRequest = z.infer<
  typeof zToBackendSetAvatarRequest
>;
export type ToBackendSetAvatarResponsePayload = z.infer<
  typeof zToBackendSetAvatarResponsePayload
>;
export type ToBackendSetAvatarResponse = z.infer<
  typeof zToBackendSetAvatarResponse
>;
