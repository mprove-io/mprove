import { z } from 'zod';

export let zFileChartDataPivotValue = z
  .object({
    field: z.string().nullish(),
    field_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartDataPivotValue' });

export type FileChartDataPivotValue = z.infer<typeof zFileChartDataPivotValue>;
