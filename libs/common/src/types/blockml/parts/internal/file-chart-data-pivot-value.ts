import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileChartDataPivotValue = {
  field?: string;
  field_line_num?: number;
};

export let zFileChartDataPivotValue = z
  .object({
    field: z.string().nullish(),
    field_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartDataPivotValue' });

assertTypesEqual<
  FileChartDataPivotValue,
  z.infer<typeof zFileChartDataPivotValue>
>({ value: true });
