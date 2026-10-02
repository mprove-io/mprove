import { z } from 'zod';

export let zSorting = z
  .object({
    fieldId: z.string(),
    desc: z.boolean()
  })
  .meta({ id: 'Sorting' });

export type Sorting = z.infer<typeof zSorting>;
