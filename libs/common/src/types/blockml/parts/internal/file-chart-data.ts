import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileChartDataPivotValue,
  zFileChartDataPivotValue
} from '#common/types/blockml/parts/internal/file-chart-data-pivot-value';

export type FileChartData = {
  x_field?: string;
  x_field_line_num?: number;
  y_fields?: string[];
  y_fields_line_num?: number;
  size_field?: string;
  size_field_line_num?: number;
  multi_field?: string;
  multi_field_line_num?: number;
  pivot_rows?: string[];
  pivot_rows_line_num?: number;
  pivot_columns?: string[];
  pivot_columns_line_num?: number;
  pivot_values?: FileChartDataPivotValue[];
  pivot_values_line_num?: number;
};

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

assertTypesEqual<FileChartData, z.infer<typeof zFileChartData>>({
  value: true
});
