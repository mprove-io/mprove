import { z } from 'zod';

export let zListener = z
  .object({
    rowId: z.string(),
    applyTo: z.string(),
    listen: z.string()
  })
  .meta({ id: 'Listener' });

export type Listener = z.infer<typeof zListener>;
