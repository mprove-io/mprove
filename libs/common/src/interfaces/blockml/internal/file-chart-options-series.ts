import { enums } from '~common/barrels/enums';

export interface FileChartOptionsSeriesElement {
  row_id?: string;
  row_id_line_num?: number;

  y_field?: string;
  y_field_line_num?: number;

  type?: enums.ChartTypeEnum;
  type_line_num?: number;

  y_axis_index?: string;
  y_axis_index_line_num?: number;
}
