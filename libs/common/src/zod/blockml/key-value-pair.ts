import { z } from 'zod';

export let zKeyValuePair = z
  .object({
    key: z.string(),
    value: z.string().optional()
  })
  .meta({ id: 'KeyValuePair' });

export type ZKeyValuePair = z.infer<typeof zKeyValuePair>;
