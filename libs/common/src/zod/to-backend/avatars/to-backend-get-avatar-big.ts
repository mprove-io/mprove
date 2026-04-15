import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetAvatarBigRequestPayload = z
  .object({
    avatarUserId: z.string()
  })
  .meta({ id: 'ToBackendGetAvatarBigRequestPayload' });

export let zToBackendGetAvatarBigRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig)
  })
  .meta({ id: 'ToBackendGetAvatarBigRequestInfo' });

export let zToBackendGetAvatarBigRequest = zToBackendRequest
  .extend({
    info: zToBackendGetAvatarBigRequestInfo,
    payload: zToBackendGetAvatarBigRequestPayload
  })
  .meta({ id: 'ToBackendGetAvatarBigRequest' });

export let zToBackendGetAvatarBigResponsePayload = z
  .object({
    avatarSmall: z.string(),
    avatarBig: z.string()
  })
  .meta({ id: 'ToBackendGetAvatarBigResponsePayload' });

export let zToBackendGetAvatarBigResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetAvatarBigResponseInfo' });

export let zToBackendGetAvatarBigResponse = zMyResponse
  .extend({
    info: zToBackendGetAvatarBigResponseInfo,
    payload: zToBackendGetAvatarBigResponsePayload
  })
  .meta({ id: 'ToBackendGetAvatarBigResponse' });

export type ToBackendGetAvatarBigRequestPayload = z.infer<
  typeof zToBackendGetAvatarBigRequestPayload
>;
export type ToBackendGetAvatarBigRequest = z.infer<
  typeof zToBackendGetAvatarBigRequest
>;
export type ToBackendGetAvatarBigResponsePayload = z.infer<
  typeof zToBackendGetAvatarBigResponsePayload
>;
export type ToBackendGetAvatarBigResponse = z.infer<
  typeof zToBackendGetAvatarBigResponse
>;
