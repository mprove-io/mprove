import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetUserCodexAuthRequestPayload = z
  .object({
    authJson: z.string()
  })
  .meta({ id: 'ToBackendSetUserCodexAuthRequestPayload' });

export let zToBackendSetUserCodexAuthRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetUserCodexAuth)
  })
  .meta({ id: 'ToBackendSetUserCodexAuthRequestInfo' });

export let zToBackendSetUserCodexAuthRequest = zToBackendRequest
  .extend({
    info: zToBackendSetUserCodexAuthRequestInfo,
    payload: zToBackendSetUserCodexAuthRequestPayload
  })
  .meta({ id: 'ToBackendSetUserCodexAuthRequest' });

export let zToBackendSetUserCodexAuthResponsePayload = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendSetUserCodexAuthResponsePayload' });

export let zToBackendSetUserCodexAuthResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSetUserCodexAuth}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetUserCodexAuthResponseInfo' });

export let zToBackendSetUserCodexAuthResponse = zMyResponse
  .extend({
    info: zToBackendSetUserCodexAuthResponseInfo,
    payload: zToBackendSetUserCodexAuthResponsePayload
  })
  .meta({ id: 'ToBackendSetUserCodexAuthResponse' });

export type ToBackendSetUserCodexAuthRequestPayload = z.infer<
  typeof zToBackendSetUserCodexAuthRequestPayload
>;
export type ToBackendSetUserCodexAuthRequest = z.infer<
  typeof zToBackendSetUserCodexAuthRequest
>;
export type ToBackendSetUserCodexAuthResponsePayload = z.infer<
  typeof zToBackendSetUserCodexAuthResponsePayload
>;
export type ToBackendSetUserCodexAuthResponse = z.infer<
  typeof zToBackendSetUserCodexAuthResponse
>;
