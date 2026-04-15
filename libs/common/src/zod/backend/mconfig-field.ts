import { z } from 'zod';
import { zModelField } from '#common/zod/blockml/model-field';
import { zSorting } from '#common/zod/blockml/sorting';

export let zMconfigField = zModelField
  .extend({
    sorting: zSorting,
    sortingNumber: z.number()
  })
  .meta({ id: 'MconfigField' });

export type MconfigField = z.infer<typeof zMconfigField>;
