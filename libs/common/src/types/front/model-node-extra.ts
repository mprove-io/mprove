import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelNode,
  zModelNode
} from '#common/types/blockml/parts/model-node';
import type { Extend } from '#common/types/extend';

export type ModelNodeExtra = Extend<
  ModelNode,
  {
    isSelected: boolean;
    isFiltered: boolean;
    children?: ModelNodeExtra[];
    joinLabel?: string;
    timeLabel?: string;
  }
>;

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

assertTypesEqual<ModelNodeExtra, z.infer<typeof zModelNodeExtra>>({
  value: true
});
