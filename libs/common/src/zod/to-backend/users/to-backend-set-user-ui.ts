import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUi } from '#common/zod/backend/ui';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetUserUiRequestPayload = z
  .object({
    ui: zUi
  })
  .meta({ id: 'ToBackendSetUserUiRequestPayload' });

export let zToBackendSetUserUiRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetUserUi)
  })
  .meta({ id: 'ToBackendSetUserUiRequestInfo' });

export let zToBackendSetUserUiRequest = zToBackendRequest
  .extend({
    info: zToBackendSetUserUiRequestInfo,
    payload: zToBackendSetUserUiRequestPayload
  })
  .meta({ id: 'ToBackendSetUserUiRequest' });

export let zToBackendSetUserUiResponsePayload = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendSetUserUiResponsePayload' });

export let zToBackendSetUserUiResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSetUserUi}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetUserUiResponseInfo' });

export let zToBackendSetUserUiResponse = zMyResponse
  .extend({
    info: zToBackendSetUserUiResponseInfo,
    payload: zToBackendSetUserUiResponsePayload
  })
  .meta({ id: 'ToBackendSetUserUiResponse' });

export type ToBackendSetUserUiRequestPayload = z.infer<
  typeof zToBackendSetUserUiRequestPayload
>;
export type ToBackendSetUserUiRequest = z.infer<
  typeof zToBackendSetUserUiRequest
>;
export type ToBackendSetUserUiResponsePayload = z.infer<
  typeof zToBackendSetUserUiResponsePayload
>;
export type ToBackendSetUserUiResponse = z.infer<
  typeof zToBackendSetUserUiResponse
>;
