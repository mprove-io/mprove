import type { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import type { EnumValues } from '#common/types/enum-values';

export type FileChartOptionsSeriesElement = {
  data_row_id?: string;
  data_row_id_line_num?: number;
  data_field?: string;
  data_field_line_num?: number;
  type?: EnumValues<typeof ChartTypeEnum>;
  type_line_num?: number;
  y_axis_index?: string;
  y_axis_index_line_num?: number;
};
