import { z } from 'zod';
import { zLlmModel } from '#common/zod/backend/provider-parts/llm-model';

export let zLlmOpenAICompatibleOptions = z
  .object({
    baseURL: z.string().trim().min(1),
    apiKey: z.string().nullish(),
    headers: z
      .array(
        z.object({
          key: z.string().trim().min(1),
          value: z.string()
        })
      )
      .nullish(),
    queryParams: z
      .array(
        z.object({
          key: z.string().trim().min(1),
          value: z.string()
        })
      )
      .nullish(),
    includeUsage: z.boolean().nullish(),
    supportsStructuredOutputs: z.boolean().nullish(),
    models: z.array(zLlmModel)
  })
  .meta({ id: 'LlmOpenAICompatibleOptions' });

export type LlmOpenAICompatibleOptions = z.infer<
  typeof zLlmOpenAICompatibleOptions
>;
