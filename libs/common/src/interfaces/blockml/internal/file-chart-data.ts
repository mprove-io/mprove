export interface FileChartData {
  x_field: string;
  x_field_line_num: number;

  y_field: string;
  y_field_line_num: number;

  y_fields: string[];
  y_fields_line_num: number;

  hide_columns: string[];
  hide_columns_line_num: number;

  multi_field: string;
  multi_field_line_num: number;

  value_field: string;
  value_field_line_num: number;

  previous_value_field: string;
  previous_value_field_line_num: number;
}
