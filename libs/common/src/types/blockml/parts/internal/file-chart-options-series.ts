import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';

export type FileChartOptionsSeriesElement = {
  data_row_id?: string;
  data_row_id_line_num?: number;
  data_field?: string;
  data_field_line_num?: number;
  type?: ChartType;
  type_line_num?: number;
  y_axis_index?: string;
  y_axis_index_line_num?: number;
};
