import { FileChartOptionsSeriesElement } from './file-chart-options-series';
import { FileChartOptionsXAxisElement } from './file-chart-options-x-axis';
import { FileChartOptionsYAxisElement } from './file-chart-options-y-axis';

export interface FileChartOptions {
  format?: string; // boolean
  format_line_num?: number;

  x_axis?: FileChartOptionsXAxisElement;
  x_axis_line_num?: number;

  y_axis?: FileChartOptionsYAxisElement[];
  y_axis_line_num?: number;

  series?: FileChartOptionsSeriesElement[];
  series_line_num?: number;
}
