import { z } from 'zod';

export let zGv = z
  .object({
    givenId: z.string(),
    values: z.array(z.string())
  })
  .meta({ id: 'Gv' });

export type Gv = z.infer<typeof zGv>;
