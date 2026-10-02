import { z } from 'zod';
import { zFileChartDataPivotValue } from '#common/types/blockml/parts/internal/file-chart-data-pivot-value';

export let zFileChartData = z
  .object({
    x_field: z.string().nullish(),
    x_field_line_num: z.number().nullish(),
    y_fields: z.array(z.string()).nullish(),
    y_fields_line_num: z.number().nullish(),
    size_field: z.string().nullish(),
    size_field_line_num: z.number().nullish(),
    multi_field: z.string().nullish(),
    multi_field_line_num: z.number().nullish(),
    pivot_rows: z.array(z.string()).nullish(),
    pivot_rows_line_num: z.number().nullish(),
    pivot_columns: z.array(z.string()).nullish(),
    pivot_columns_line_num: z.number().nullish(),
    pivot_values: z.array(zFileChartDataPivotValue).nullish(),
    pivot_values_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartData' });

export type FileChartData = z.infer<typeof zFileChartData>;
