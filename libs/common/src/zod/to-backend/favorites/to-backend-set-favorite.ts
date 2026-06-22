import { z } from 'zod';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetFavoriteRequestPayload = z
  .object({
    projectId: z.string(),
    type: z.enum(FavoriteTypeEnum),
    targetId: z.string(),
    isFavorite: z.boolean()
  })
  .meta({ id: 'ToBackendSetFavoriteRequestPayload' });

export let zToBackendSetFavoriteRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetFavorite)
  })
  .meta({ id: 'ToBackendSetFavoriteRequestInfo' });

export let zToBackendSetFavoriteRequest = zToBackendRequest
  .extend({
    info: zToBackendSetFavoriteRequestInfo,
    payload: zToBackendSetFavoriteRequestPayload
  })
  .meta({ id: 'ToBackendSetFavoriteRequest' });

export let zToBackendSetFavoriteResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendSetFavoriteResponsePayload' });

export let zToBackendSetFavoriteResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSetFavorite}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetFavoriteResponseInfo' });

export let zToBackendSetFavoriteResponse = zMyResponse
  .extend({
    info: zToBackendSetFavoriteResponseInfo,
    payload: zToBackendSetFavoriteResponsePayload
  })
  .meta({ id: 'ToBackendSetFavoriteResponse' });

export type ToBackendSetFavoriteRequestPayload = z.infer<
  typeof zToBackendSetFavoriteRequestPayload
>;
export type ToBackendSetFavoriteRequest = z.infer<
  typeof zToBackendSetFavoriteRequest
>;
export type ToBackendSetFavoriteResponsePayload = z.infer<
  typeof zToBackendSetFavoriteResponsePayload
>;
export type ToBackendSetFavoriteResponse = z.infer<
  typeof zToBackendSetFavoriteResponse
>;
