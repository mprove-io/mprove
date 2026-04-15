import { z } from 'zod';

export let zEv = z
  .object({
    evId: z.string(),
    val: z.string()
  })
  .meta({ id: 'Ev' });

export type Ev = z.infer<typeof zEv>;
