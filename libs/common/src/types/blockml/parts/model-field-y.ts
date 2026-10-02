import { z } from 'zod';
import { zModelField } from '#common/types/blockml/parts/model-field';

export let zModelFieldY = zModelField
  .extend({
    partLabel: z.string()
  })
  .meta({ id: 'ModelFieldY' });

export type ModelFieldY = z.infer<typeof zModelFieldY>;
