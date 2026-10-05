import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const fractionLogicValues = ['OR', 'AND_NOT'] as const;

export type FractionLogic = (typeof fractionLogicValues)[number];

export let zFractionLogic = z.enum(fractionLogicValues);

assertTypesEqual<FractionLogic, z.infer<typeof zFractionLogic>>({
  value: true
});
