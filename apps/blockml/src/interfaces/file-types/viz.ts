import { FileBasic } from '~blockml/interfaces/file/file-basic';
import { Report } from '~blockml/interfaces/report';

export interface Viz extends FileBasic {
  viz?: string;
  viz_line_num?: number;

  hidden?: string; // boolean
  hidden_line_num?: number;

  group?: string;
  group_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  reports?: Report[];
  reports_line_num?: number;
}
