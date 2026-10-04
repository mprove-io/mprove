import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const fractionNumberBetweenOptionValues = [
  'Inclusive',
  'LeftInclusive',
  'RightInclusive',
  'Exclusive'
] as const;

export type FractionNumberBetweenOption =
  (typeof fractionNumberBetweenOptionValues)[number];

export let zFractionNumberBetweenOption = z.enum(
  fractionNumberBetweenOptionValues
);

assertTypesEqual<
  FractionNumberBetweenOption,
  z.infer<typeof zFractionNumberBetweenOption>
>({
  value: true
});
