import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelField,
  zModelField
} from '#common/types/blockml/parts/model/model-field';
import {
  type Sorting,
  zSorting
} from '#common/types/blockml/parts/query/sorting';
import type { Extend } from '#common/types/extend';

export type MconfigField = Extend<
  ModelField,
  { sorting?: Sorting; sortingNumber: number }
>;

export let zMconfigField = zModelField
  .extend({
    sorting: zSorting.nullish(),
    sortingNumber: z.number()
  })
  .meta({ id: 'MconfigField' });

assertTypesEqual<MconfigField, z.infer<typeof zMconfigField>>({ value: true });
