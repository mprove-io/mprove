import type { FileChartOptionsSeriesElement } from '#common/types/blockml/parts/internal/file-chart-options-series';
import type { FileChartOptionsXAxisElement } from '#common/types/blockml/parts/internal/file-chart-options-x-axis';
import type { FileChartOptionsYAxisElement } from '#common/types/blockml/parts/internal/file-chart-options-y-axis';

export type FileChartOptions = {
  format?: string;
  format_line_num?: number;
  first_column_width?: string;
  first_column_width_line_num?: number;
  value_columns_width?: string;
  value_columns_width_line_num?: number;
  x_axis?: FileChartOptionsXAxisElement;
  x_axis_line_num?: number;
  y_axis?: FileChartOptionsYAxisElement[];
  y_axis_line_num?: number;
  series?: FileChartOptionsSeriesElement[];
  series_line_num?: number;
};
