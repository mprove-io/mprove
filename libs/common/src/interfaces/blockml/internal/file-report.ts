import { FilterBricksDictionary } from '../filter-bricks-dictionary';
import { FieldAny } from './field-any';
import { FileBasic } from './file-basic';
import { FileReportRow } from './file-report-row';

export interface FileReport extends FileBasic {
  report?: string;
  report_line_num?: number;

  title?: string;
  title_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  rows?: FileReportRow[];
  rows_line_num?: number;

  parameters?: FieldAny[];
  parameters_line_num?: number;

  fields?: FieldAny[];
  fields_line_num?: number;

  //

  filters?: FilterBricksDictionary;
}
