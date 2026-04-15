import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGenerateUserApiKeyRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendGenerateUserApiKeyRequestPayload' });

export let zToBackendGenerateUserApiKeyRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGenerateUserApiKey)
  })
  .meta({ id: 'ToBackendGenerateUserApiKeyRequestInfo' });

export let zToBackendGenerateUserApiKeyRequest = zToBackendRequest
  .extend({
    info: zToBackendGenerateUserApiKeyRequestInfo,
    payload: zToBackendGenerateUserApiKeyRequestPayload
  })
  .meta({ id: 'ToBackendGenerateUserApiKeyRequest' });

export let zToBackendGenerateUserApiKeyResponsePayload = z
  .object({
    apiKey: z.string(),
    apiKeyPrefix: z.string()
  })
  .meta({ id: 'ToBackendGenerateUserApiKeyResponsePayload' });

export let zToBackendGenerateUserApiKeyResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGenerateUserApiKey}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGenerateUserApiKeyResponseInfo' });

export let zToBackendGenerateUserApiKeyResponse = zMyResponse
  .extend({
    info: zToBackendGenerateUserApiKeyResponseInfo,
    payload: zToBackendGenerateUserApiKeyResponsePayload
  })
  .meta({ id: 'ToBackendGenerateUserApiKeyResponse' });

export type ToBackendGenerateUserApiKeyRequestPayload = z.infer<
  typeof zToBackendGenerateUserApiKeyRequestPayload
>;
export type ToBackendGenerateUserApiKeyRequest = z.infer<
  typeof zToBackendGenerateUserApiKeyRequest
>;
export type ToBackendGenerateUserApiKeyResponsePayload = z.infer<
  typeof zToBackendGenerateUserApiKeyResponsePayload
>;
export type ToBackendGenerateUserApiKeyResponse = z.infer<
  typeof zToBackendGenerateUserApiKeyResponse
>;
