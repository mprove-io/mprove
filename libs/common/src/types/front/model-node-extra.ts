import { z } from 'zod';
import { zModelNode } from '#common/types/blockml/parts/model-node';

export let zModelNodeExtra = zModelNode
  .extend({
    isSelected: z.boolean(),
    isFiltered: z.boolean(),
    get children() {
      return z.array(zModelNodeExtra).nullish();
    },
    joinLabel: z.string().nullish(),
    timeLabel: z.string().nullish()
  })
  .meta({ id: 'ModelNodeExtra' });

export type ModelNodeExtra = z.infer<typeof zModelNodeExtra>;
