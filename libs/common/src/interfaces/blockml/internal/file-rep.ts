import { FileBasic } from './file-basic';
import { FileRepRow } from './file-rep-row';

export interface FileRep extends FileBasic {
  report?: string;
  report_line_num?: number;

  title?: string;
  title_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  rows?: FileRepRow[];
  rows_line_num?: number;
}
