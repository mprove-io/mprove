import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const fractionTsLastCompleteOptionValues = [
  'CompleteWithCurrent',
  'CompletePlusCurrent',
  'Complete'
] as const;

export type FractionTsLastCompleteOption =
  (typeof fractionTsLastCompleteOptionValues)[number];

export let zFractionTsLastCompleteOption = z.enum(
  fractionTsLastCompleteOptionValues
);

assertTypesEqual<
  FractionTsLastCompleteOption,
  z.infer<typeof zFractionTsLastCompleteOption>
>({
  value: true
});
