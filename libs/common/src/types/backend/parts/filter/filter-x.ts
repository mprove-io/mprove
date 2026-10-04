import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type Filter,
  zFilter
} from '#common/types/blockml/parts/filter/filter';
import type { Extend } from '#common/types/extend';

export type FilterX = Extend<Filter, { field: any }>;

export let zFilterX = zFilter
  .extend({
    field: z.any()
  })
  .meta({ id: 'FilterX' });

assertTypesEqual<FilterX, z.infer<typeof zFilterX>>({ value: true });
