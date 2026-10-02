import { z } from 'zod';

export let zDeleteFilterFnItem = z
  .object({
    filterFieldId: z.string(),
    tileTitle: z.string()
  })
  .meta({ id: 'DeleteFilterFnItem' });

export type DeleteFilterFnItem = z.infer<typeof zDeleteFilterFnItem>;
