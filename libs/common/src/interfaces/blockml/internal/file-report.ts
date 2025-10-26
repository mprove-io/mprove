import { FieldAny } from './field-any';
import { FileBasic } from './file-basic';
import { FileChartOptions } from './file-chart-options';
import { FileReportRow } from './file-report-row';

export interface FileReport extends FileBasic {
  report?: string;
  report_line_num?: number;

  title?: string;
  title_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  rows?: FileReportRow[];
  rows_line_num?: number;

  options?: FileChartOptions;
  options_line_num?: number;

  parameters?: FieldAny[];
  parameters_line_num?: number;

  fields?: FieldAny[];
  fields_line_num?: number;

  //

  tiles?: {
    options?: FileChartOptions;
  }[];
}
