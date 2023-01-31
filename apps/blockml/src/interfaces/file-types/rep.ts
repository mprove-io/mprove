import { FileBasic } from '~blockml/interfaces/file/file-basic';
import { RepRow } from '../rep-row';

export interface Rep extends FileBasic {
  report?: string;
  report_line_num?: number;

  title?: string;
  title_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  rows?: RepRow[];
  rows_line_num?: number;
}
