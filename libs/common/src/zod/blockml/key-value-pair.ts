import { z } from 'zod';

export let zKeyValuePair = z
  .object({
    key: z.string(),
    value: z.string().nullish()
  })
  .meta({ id: 'KeyValuePair' });

export type KeyValuePair = z.infer<typeof zKeyValuePair>;
