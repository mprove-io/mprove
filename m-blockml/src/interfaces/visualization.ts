import { FileTopBasic } from './file-top-basic';
import { FieldExt } from './field-ext';
import { Report } from './report';

export interface Visualization extends FileTopBasic {
  visualization: string;
  visualization_line_num: number;

  hidden: string; // boolean
  hidden_line_num: number;

  group: string;
  group_line_num: number;

  accessUsers: string[];
  accessUsers_line_num: number;

  report: Report;
  report_line_num: number;
}
