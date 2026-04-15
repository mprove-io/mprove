import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteUserApiKeyRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserApiKeyRequestPayload' });

export let zToBackendDeleteUserApiKeyRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteUserApiKey)
  })
  .meta({ id: 'ToBackendDeleteUserApiKeyRequestInfo' });

export let zToBackendDeleteUserApiKeyRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteUserApiKeyRequestInfo,
    payload: zToBackendDeleteUserApiKeyRequestPayload
  })
  .meta({ id: 'ToBackendDeleteUserApiKeyRequest' });

export let zToBackendDeleteUserApiKeyResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserApiKeyResponsePayload' });

export let zToBackendDeleteUserApiKeyResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendDeleteUserApiKey}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteUserApiKeyResponseInfo' });

export let zToBackendDeleteUserApiKeyResponse = zMyResponse
  .extend({
    info: zToBackendDeleteUserApiKeyResponseInfo,
    payload: zToBackendDeleteUserApiKeyResponsePayload
  })
  .meta({ id: 'ToBackendDeleteUserApiKeyResponse' });

export type ToBackendDeleteUserApiKeyRequestPayload = z.infer<
  typeof zToBackendDeleteUserApiKeyRequestPayload
>;
export type ToBackendDeleteUserApiKeyRequest = z.infer<
  typeof zToBackendDeleteUserApiKeyRequest
>;
export type ToBackendDeleteUserApiKeyResponsePayload = z.infer<
  typeof zToBackendDeleteUserApiKeyResponsePayload
>;
export type ToBackendDeleteUserApiKeyResponse = z.infer<
  typeof zToBackendDeleteUserApiKeyResponse
>;
