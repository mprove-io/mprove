import type { FileChartDataPivotValue } from '#common/types/blockml/parts/internal/file-chart-data-pivot-value';

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
