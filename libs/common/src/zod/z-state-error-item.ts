import { z } from 'zod';

export let zStateErrorItem = z.object({
  title: z.string(),
  message: z.string()
});
