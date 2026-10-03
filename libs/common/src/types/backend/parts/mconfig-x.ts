import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type FilterX, zFilterX } from '#common/types/backend/parts/filter-x';
import {
  type MconfigField,
  zMconfigField
} from '#common/types/backend/parts/mconfig-field';
import { type Mconfig, zMconfig } from '#common/types/blockml/parts/mconfig';
import type { Extend } from '#common/types/extend';

export type MconfigX = Extend<
  Mconfig,
  { fields: MconfigField[]; extendedFilters: FilterX[] }
>;

export let zMconfigX = zMconfig
  .extend({
    fields: z.array(zMconfigField),
    extendedFilters: z.array(zFilterX)
  })
  .meta({ id: 'MconfigX' });

assertTypesEqual<MconfigX, z.infer<typeof zMconfigX>>({ value: true });
