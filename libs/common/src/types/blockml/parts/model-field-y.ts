import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelField,
  zModelField
} from '#common/types/blockml/parts/model-field';
import type { Extend } from '#common/types/extend';

export type ModelFieldY = Extend<ModelField, { partLabel: string }>;

export let zModelFieldY = zModelField
  .extend({
    partLabel: z.string()
  })
  .meta({ id: 'ModelFieldY' });

assertTypesEqual<ModelFieldY, z.infer<typeof zModelFieldY>>({ value: true });
