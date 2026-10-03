import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/parts/bml-error';
import type { Extend } from '#common/types/extend';

export type BmlErrorExtra = Extend<
  BmlError,
  { errorExt: any; sortOrder: number }
>;

export let zBmlErrorExtra = zBmlError
  .extend({
    errorExt: z.any(),
    sortOrder: z.number()
  })
  .meta({ id: 'BmlErrorExtra' });

assertTypesEqual<BmlErrorExtra, z.infer<typeof zBmlErrorExtra>>({
  value: true
});
