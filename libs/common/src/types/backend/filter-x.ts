import { z } from 'zod';
import { zFilter } from '#common/types/blockml/filter';

export let zFilterX = zFilter
  .extend({
    field: z.any()
  })
  .meta({ id: 'FilterX' });

export type FilterX = z.infer<typeof zFilterX>;
