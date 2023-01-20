import { FileBasic } from '~blockml/interfaces/file/file-basic';
import { RepRow } from '../rep-row';

export interface Rep extends FileBasic {
  report?: string;
  report_line_num?: number;

  title?: string;
  title_line_num?: number;

  rows?: RepRow[];
  rows_line_num?: number;
}
