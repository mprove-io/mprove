import { enums } from '~common/barrels/enums';
import { FileBasic } from './file-basic';

export interface FileMetric extends FileBasic {
  metric?: string;
  metric_line_num?: number;

  type?: enums.MetricTypeEnum;
  type_line_num?: number;

  label?: string;
  label_line_num?: number;

  time_spec?: enums.TimeSpecEnum;
  time_spec_line_num?: number;

  model?: string;
  model_line_num?: number;

  time?: string;
  time_line_num?: number;

  field?: string;
  field_line_num?: number;

  api?: string;
  api_line_num?: number;

  formula?: string;
  formula_line_num?: number;

  sql?: string;
  sql_line_num?: number;

  connection?: string;
  connection_line_num?: number;

  description?: string;
  description_line_num?: number;

  params?: any[];
  params_line_num?: number;
}
