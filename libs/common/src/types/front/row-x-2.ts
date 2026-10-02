import { z } from 'zod';
import { zModelField } from '#common/types/blockml/parts/model-field';
import { zRow } from '#common/types/blockml/parts/row';

export let zRowX2 = zRow
  .extend({
    modelFields: z.record(z.string(), z.array(zModelField)).nullish(),
    mconfigListenSwap: z.record(z.string(), z.array(z.string())).nullish()
  })
  .meta({ id: 'RowX2' });

export type RowX2 = z.infer<typeof zRowX2>;
