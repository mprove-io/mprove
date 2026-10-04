import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const fractionQuarterOfYearValueValues = ['q1', 'q2', 'q3', 'q4'] as const;

export type FractionQuarterOfYearValue =
  (typeof fractionQuarterOfYearValueValues)[number];

export let zFractionQuarterOfYearValue = z.enum(
  fractionQuarterOfYearValueValues
);

assertTypesEqual<
  FractionQuarterOfYearValue,
  z.infer<typeof zFractionQuarterOfYearValue>
>({
  value: true
});
