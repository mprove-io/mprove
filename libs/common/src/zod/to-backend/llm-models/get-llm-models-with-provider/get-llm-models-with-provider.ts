import { z } from 'zod';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zLlmModelWithProvider } from '#common/zod/backend/llm-models/llm-model-with-provider';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetLlmModelsWithProviderRequestPayload = z
  .object({
    projectId: z.string(),
    sessionTypes: z.array(z.enum(SessionTypeEnum))
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderRequestPayload' });

export let zToBackendGetLlmModelsWithProviderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendGetLlmModelsWithProvider
    )
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderRequestInfo' });

export let zToBackendGetLlmModelsWithProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendGetLlmModelsWithProviderRequestInfo,
    payload: zToBackendGetLlmModelsWithProviderRequestPayload
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderRequest' });

export let zToBackendGetLlmModelsWithProviderResponsePayload = z
  .object({
    modelsOpencode: z.array(zLlmModelWithProvider),
    modelsAi: z.array(zLlmModelWithProvider)
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderResponsePayload' });

export let zToBackendGetLlmModelsWithProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetLlmModelsWithProvider}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderResponseInfo' });

export let zToBackendGetLlmModelsWithProviderResponse = zMyResponse
  .extend({
    info: zToBackendGetLlmModelsWithProviderResponseInfo,
    payload: zToBackendGetLlmModelsWithProviderResponsePayload
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderResponse' });

export type ToBackendGetLlmModelsWithProviderRequestPayload = z.infer<
  typeof zToBackendGetLlmModelsWithProviderRequestPayload
>;
export type ToBackendGetLlmModelsWithProviderRequest = z.infer<
  typeof zToBackendGetLlmModelsWithProviderRequest
>;
export type ToBackendGetLlmModelsWithProviderResponsePayload = z.infer<
  typeof zToBackendGetLlmModelsWithProviderResponsePayload
>;
export type ToBackendGetLlmModelsWithProviderResponse = z.infer<
  typeof zToBackendGetLlmModelsWithProviderResponse
>;
