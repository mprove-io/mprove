import { FileBasic } from './file-basic';
import { FilePartReport } from './file-part-report';

export interface FileVis extends FileBasic {
  vis?: string;
  vis_line_num?: number;

  hidden?: string; // boolean
  hidden_line_num?: number;

  group?: string;
  group_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  reports?: FilePartReport[];
  reports_line_num?: number;
}
