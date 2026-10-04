import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const relativeDayDirectionValues = ['last', 'next'] as const;

export type RelativeDayDirection = (typeof relativeDayDirectionValues)[number];

export let zRelativeDayDirection = z.enum(relativeDayDirectionValues);

assertTypesEqual<RelativeDayDirection, z.infer<typeof zRelativeDayDirection>>({
  value: true
});
