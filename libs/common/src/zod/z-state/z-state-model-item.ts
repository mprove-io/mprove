import { z } from 'zod';

export let zStateModelItem = z.object({
  modelId: z.string().nullish(),
  url: z.string().nullish()
});
