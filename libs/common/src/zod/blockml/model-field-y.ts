import { z } from 'zod';
import { zModelField } from '#common/zod/blockml/model-field';

export let zModelFieldY = zModelField
  .extend({
    partLabel: z.string()
  })
  .meta({ id: 'ModelFieldY' });

export type ModelFieldY = z.infer<typeof zModelFieldY>;
