import { z } from 'zod';

export let zLlmModel = z
  .object({
    modelId: z.string().trim().min(1),
    name: z.string().trim().nullish()
  })
  .meta({ id: 'LlmModel' });

export type LlmModel = z.infer<typeof zLlmModel>;
