import { z } from 'zod';
import { ProviderKindEnum } from '#common/enums/provider-kind.enum';
import { ProviderLlmTypeEnum } from '#common/enums/provider-llm-type.enum';
import { zLlmOpenAICompatibleOptions } from '#common/zod/backend/provider-parts/llm-openai-compatible-options';

export let zProvider = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    kind: z.literal(ProviderKindEnum.LLM),
    type: z.literal(ProviderLlmTypeEnum.OpenAICompatible),
    isEnabled: z.boolean(),
    options: zLlmOpenAICompatibleOptions,
    serverTs: z.number().int().nullish()
  })
  .meta({ id: 'Provider' });

export type Provider = z.infer<typeof zProvider>;
