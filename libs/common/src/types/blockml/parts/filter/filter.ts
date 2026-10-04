import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type Fraction,
  zFraction
} from '#common/types/blockml/parts/fraction/fraction';

export type Filter = { fieldId: string; fractions: Fraction[] };

export let zFilter = z
  .object({
    fieldId: z.string(),
    fractions: z.array(zFraction)
  })
  .meta({ id: 'Filter' });

assertTypesEqual<Filter, z.infer<typeof zFilter>>({ value: true });
