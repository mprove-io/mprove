import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const pivotSortDirectionValues = ['asc', 'desc'] as const;

export type PivotSortDirection = (typeof pivotSortDirectionValues)[number];

export let zPivotSortDirection = z.enum(pivotSortDirectionValues);

assertTypesEqual<PivotSortDirection, z.infer<typeof zPivotSortDirection>>({
  value: true
});
