import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteUserCodexAuthRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserCodexAuthRequestPayload' });

export let zToBackendDeleteUserCodexAuthRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteUserCodexAuth)
  })
  .meta({ id: 'ToBackendDeleteUserCodexAuthRequestInfo' });

export let zToBackendDeleteUserCodexAuthRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteUserCodexAuthRequestInfo,
    payload: zToBackendDeleteUserCodexAuthRequestPayload
  })
  .meta({ id: 'ToBackendDeleteUserCodexAuthRequest' });

export let zToBackendDeleteUserCodexAuthResponsePayload = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendDeleteUserCodexAuthResponsePayload' });

export let zToBackendDeleteUserCodexAuthResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendDeleteUserCodexAuth}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteUserCodexAuthResponseInfo' });

export let zToBackendDeleteUserCodexAuthResponse = zMyResponse
  .extend({
    info: zToBackendDeleteUserCodexAuthResponseInfo,
    payload: zToBackendDeleteUserCodexAuthResponsePayload
  })
  .meta({ id: 'ToBackendDeleteUserCodexAuthResponse' });

export type ToBackendDeleteUserCodexAuthRequestPayload = z.infer<
  typeof zToBackendDeleteUserCodexAuthRequestPayload
>;
export type ToBackendDeleteUserCodexAuthRequest = z.infer<
  typeof zToBackendDeleteUserCodexAuthRequest
>;
export type ToBackendDeleteUserCodexAuthResponsePayload = z.infer<
  typeof zToBackendDeleteUserCodexAuthResponsePayload
>;
export type ToBackendDeleteUserCodexAuthResponse = z.infer<
  typeof zToBackendDeleteUserCodexAuthResponse
>;
