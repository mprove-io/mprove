import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Fraction, zFraction } from '#common/types/blockml/parts/fraction';

export type Parameter = {
  apply_to: string;
  listen: string;
  fractions: Fraction[];
};

export let zParameter = z
  .object({
    apply_to: z.string(),
    listen: z.string(),
    fractions: z.array(zFraction)
  })
  .meta({ id: 'Parameter' });

assertTypesEqual<Parameter, z.infer<typeof zParameter>>({ value: true });
