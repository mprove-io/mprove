import { common } from '~blockml/barrels/common';
import { FileBasic } from '~blockml/interfaces/file/file-basic';
import { RepRow } from '../rep-row';

export interface Rep extends FileBasic {
  report?: string;
  report_line_num?: number;

  title?: string;
  title_line_num?: number;

  timezone?: string;
  timezone_line_num?: number;

  time_spec?: common.TimeSpecEnum;
  time_spec_line_num?: number;

  time_range?: string;
  time_range_line_num?: number;

  rows?: RepRow[];
  rows_line_num?: number;
}
