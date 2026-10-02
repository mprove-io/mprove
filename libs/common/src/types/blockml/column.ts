import { z } from 'zod';

export let zColumn = z
  .object({
    columnId: z.number().int(),
    label: z.string()
  })
  .meta({ id: 'Column' });

export type Column = z.infer<typeof zColumn>;
