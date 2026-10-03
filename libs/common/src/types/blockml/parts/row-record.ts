import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type RowRecord = {
  id: number;
  columnLabel: string;
  key: number;
  value: any;
  error: any;
};

export let zRowRecord = z
  .object({
    id: z.number(),
    columnLabel: z.string(),
    key: z.number(),
    value: z.any(),
    error: z.any()
  })
  .meta({ id: 'RowRecord' });

assertTypesEqual<RowRecord, z.infer<typeof zRowRecord>>({ value: true });
