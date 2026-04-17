import { z } from 'zod';
import { zModelField } from '#common/zod/blockml/model-field';
import { zRow } from '#common/zod/blockml/row';

export let zRowX2 = zRow
  .extend({
    modelFields: z.record(z.string(), z.array(zModelField)).nullish(),
    mconfigListenSwap: z.record(z.string(), z.array(z.string())).nullish()
  })
  .meta({ id: 'RowX2' });

export type RowX2 = z.infer<typeof zRowX2>;
