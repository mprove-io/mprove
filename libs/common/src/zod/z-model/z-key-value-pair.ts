import { z } from 'zod';

export let zKeyValuePair = z.object({
  key: z.string().nullish(),
  value: z.string().nullish()
});
