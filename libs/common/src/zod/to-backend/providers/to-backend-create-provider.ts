import { z } from 'zod';
import { ProviderKindEnum } from '#common/enums/provider-kind.enum';
import { ProviderLlmTypeEnum } from '#common/enums/provider-llm-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zProvider } from '#common/zod/backend/provider';
import { zLlmOpenAICompatibleOptions } from '#common/zod/backend/provider-parts/llm-openai-compatible-options';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateProviderRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z
      .string()
      .max(32)
      .regex(/^[a-z0-9_]+$/, {
        message:
          'providerId must contain only lowercase letters, digits or underscores'
      }),
    kind: z.literal(ProviderKindEnum.LLM),
    type: z.literal(ProviderLlmTypeEnum.OpenAICompatible),
    isEnabled: z.boolean(),
    options: zLlmOpenAICompatibleOptions
  })
  .meta({ id: 'ToBackendCreateProviderRequestPayload' });

export let zToBackendCreateProviderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateProvider)
  })
  .meta({ id: 'ToBackendCreateProviderRequestInfo' });

export let zToBackendCreateProviderRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateProviderRequestInfo,
    payload: zToBackendCreateProviderRequestPayload
  })
  .meta({ id: 'ToBackendCreateProviderRequest' });

export let zToBackendCreateProviderResponsePayload = z
  .object({
    provider: zProvider
  })
  .meta({ id: 'ToBackendCreateProviderResponsePayload' });

export let zToBackendCreateProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateProvider}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateProviderResponseInfo' });

export let zToBackendCreateProviderResponse = zMyResponse
  .extend({
    info: zToBackendCreateProviderResponseInfo,
    payload: zToBackendCreateProviderResponsePayload
  })
  .meta({ id: 'ToBackendCreateProviderResponse' });

export type ToBackendCreateProviderRequestPayload = z.infer<
  typeof zToBackendCreateProviderRequestPayload
>;
export type ToBackendCreateProviderRequest = z.infer<
  typeof zToBackendCreateProviderRequest
>;
export type ToBackendCreateProviderResponsePayload = z.infer<
  typeof zToBackendCreateProviderResponsePayload
>;
export type ToBackendCreateProviderResponse = z.infer<
  typeof zToBackendCreateProviderResponse
>;
