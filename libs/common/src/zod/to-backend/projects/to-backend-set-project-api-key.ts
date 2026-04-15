import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProject } from '#common/zod/backend/project';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSetProjectApiKeyRequestPayload = z
  .object({
    projectId: z.string(),
    zenApiKey: z.string().nullish(),
    anthropicApiKey: z.string().nullish(),
    openaiApiKey: z.string().nullish(),
    e2bApiKey: z.string().nullish()
  })
  .meta({ id: 'ToBackendSetProjectApiKeyRequestPayload' });

export let zToBackendSetProjectApiKeyRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSetProjectApiKey)
  })
  .meta({ id: 'ToBackendSetProjectApiKeyRequestInfo' });

export let zToBackendSetProjectApiKeyRequest = zToBackendRequest
  .extend({
    info: zToBackendSetProjectApiKeyRequestInfo,
    payload: zToBackendSetProjectApiKeyRequestPayload
  })
  .meta({ id: 'ToBackendSetProjectApiKeyRequest' });

export let zToBackendSetProjectApiKeyResponsePayload = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectApiKeyResponsePayload' });

export let zToBackendSetProjectApiKeyResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendSetProjectApiKey}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSetProjectApiKeyResponseInfo' });

export let zToBackendSetProjectApiKeyResponse = zMyResponse
  .extend({
    info: zToBackendSetProjectApiKeyResponseInfo,
    payload: zToBackendSetProjectApiKeyResponsePayload
  })
  .meta({ id: 'ToBackendSetProjectApiKeyResponse' });

export type ToBackendSetProjectApiKeyRequestPayload = z.infer<
  typeof zToBackendSetProjectApiKeyRequestPayload
>;
export type ToBackendSetProjectApiKeyRequest = z.infer<
  typeof zToBackendSetProjectApiKeyRequest
>;
export type ToBackendSetProjectApiKeyResponsePayload = z.infer<
  typeof zToBackendSetProjectApiKeyResponsePayload
>;
export type ToBackendSetProjectApiKeyResponse = z.infer<
  typeof zToBackendSetProjectApiKeyResponse
>;
