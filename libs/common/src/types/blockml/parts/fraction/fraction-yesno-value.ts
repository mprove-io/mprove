import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const fractionYesnoValueValues = [
  // TODO: yesno
  'Yes',
  'No'
] as const;

export type FractionYesnoValue = (typeof fractionYesnoValueValues)[number];

export let zFractionYesnoValue = z.enum(fractionYesnoValueValues);

assertTypesEqual<FractionYesnoValue, z.infer<typeof zFractionYesnoValue>>({
  value: true
});
