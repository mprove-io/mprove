import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProvider } from '#common/zod/backend/provider';
import { zLlmModel } from '#common/zod/backend/provider-parts/llm-model';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendAddProviderModelRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    model: zLlmModel
  })
  .meta({ id: 'ToBackendAddProviderModelRequestPayload' });

export let zToBackendAddProviderModelRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendAddProviderModel)
  })
  .meta({ id: 'ToBackendAddProviderModelRequestInfo' });

export let zToBackendAddProviderModelRequest = zToBackendRequest
  .extend({
    info: zToBackendAddProviderModelRequestInfo,
    payload: zToBackendAddProviderModelRequestPayload
  })
  .meta({ id: 'ToBackendAddProviderModelRequest' });

export let zToBackendAddProviderModelResponsePayload = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendAddProviderModelResponsePayload' });

export let zToBackendAddProviderModelResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendAddProviderModel}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendAddProviderModelResponseInfo' });

export let zToBackendAddProviderModelResponse = zMyResponse
  .extend({
    info: zToBackendAddProviderModelResponseInfo,
    payload: zToBackendAddProviderModelResponsePayload
  })
  .meta({ id: 'ToBackendAddProviderModelResponse' });

export type ToBackendAddProviderModelRequestPayload = z.infer<
  typeof zToBackendAddProviderModelRequestPayload
>;
export type ToBackendAddProviderModelRequest = z.infer<
  typeof zToBackendAddProviderModelRequest
>;
export type ToBackendAddProviderModelResponsePayload = z.infer<
  typeof zToBackendAddProviderModelResponsePayload
>;
export type ToBackendAddProviderModelResponse = z.infer<
  typeof zToBackendAddProviderModelResponse
>;
