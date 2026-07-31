import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProvider } from '#common/zod/backend/provider';
import { zLlmOpenAICompatibleOptions } from '#common/zod/backend/provider-parts/llm-openai-compatible-options';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditProviderRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    isEnabled: z.boolean(),
    options: zLlmOpenAICompatibleOptions
  })
  .meta({ id: 'ToBackendEditProviderRequestPayload' });

export let zToBackendEditProviderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditProvider)
  })
  .meta({ id: 'ToBackendEditProviderRequestInfo' });

export let zToBackendEditProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendEditProviderRequestInfo,
    payload: zToBackendEditProviderRequestPayload
  })
  .meta({ id: 'ToBackendEditProviderRequest' });

export let zToBackendEditProviderResponsePayload = z
  .object({
    provider: zProvider
  })
  .meta({ id: 'ToBackendEditProviderResponsePayload' });

export let zToBackendEditProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendEditProvider}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditProviderResponseInfo' });

export let zToBackendEditProviderResponse = zMyResponse
  .extend({
    info: zToBackendEditProviderResponseInfo,
    payload: zToBackendEditProviderResponsePayload
  })
  .meta({ id: 'ToBackendEditProviderResponse' });

export type ToBackendEditProviderRequestPayload = z.infer<
  typeof zToBackendEditProviderRequestPayload
>;
export type ToBackendEditProviderRequest = z.infer<
  typeof zToBackendEditProviderRequest
>;
export type ToBackendEditProviderResponsePayload = z.infer<
  typeof zToBackendEditProviderResponsePayload
>;
export type ToBackendEditProviderResponse = z.infer<
  typeof zToBackendEditProviderResponse
>;
