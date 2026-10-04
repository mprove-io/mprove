import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const rowTypeValues = ['empty', 'header', 'metric', 'formula'] as const;

export type RowType = (typeof rowTypeValues)[number];

export let zRowType = z.enum(rowTypeValues);

assertTypesEqual<RowType, z.infer<typeof zRowType>>({
  value: true
});
