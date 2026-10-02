import { z } from 'zod';
import { zModelField } from '#common/types/blockml/model-field';
import { zSorting } from '#common/types/blockml/sorting';

export let zMconfigField = zModelField
  .extend({
    sorting: zSorting.nullish(),
    sortingNumber: z.number()
  })
  .meta({ id: 'MconfigField' });

export type MconfigField = z.infer<typeof zMconfigField>;
