import { z } from 'zod';

export let zTimezone = z
  .object({
    value: z.string(),
    name: z.string()
  })
  .meta({ id: 'Timezone' });

export type Timezone = z.infer<typeof zTimezone>;
