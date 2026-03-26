import { z } from 'zod';

export let zStateModelItem = z.object({
  modelId: z.string(),
  url: z.string()
});
