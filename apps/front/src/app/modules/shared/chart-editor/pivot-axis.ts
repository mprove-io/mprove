import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const pivotAxisValues = ['values', 'rows', 'columns'] as const;

export type PivotAxis = (typeof pivotAxisValues)[number];

export let zPivotAxis = z.enum(pivotAxisValues);

assertTypesEqual<PivotAxis, z.infer<typeof zPivotAxis>>({
  value: true
});
