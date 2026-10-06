import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const fractionOperatorValues = ['Or', 'And'] as const;

export type FractionOperator = (typeof fractionOperatorValues)[number];

export let zFractionOperator = z.enum(fractionOperatorValues);

assertTypesEqual<FractionOperator, z.infer<typeof zFractionOperator>>({
  value: true
});
