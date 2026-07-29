import { z } from 'zod';
import { zLlmModel } from '#common/zod/backend/provider-parts/llm-model';

export let zLlmOpenAICompatibleOptions = z
  .object({
    baseURL: z.string().trim().min(1),
    apiKey: z.string().nullish(),
    headers: z.record(z.string().min(1), z.string()).nullish(),
    queryParams: z.record(z.string().min(1), z.string()).nullish(),
    includeUsage: z.boolean().nullish(),
    supportsStructuredOutputs: z.boolean().nullish(),
    models: z.array(zLlmModel)
  })
  .meta({ id: 'LlmOpenAICompatibleOptions' });

export type LlmOpenAICompatibleOptions = z.infer<
  typeof zLlmOpenAICompatibleOptions
>;
