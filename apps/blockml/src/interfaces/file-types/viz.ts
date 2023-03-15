import { common } from '~blockml/barrels/common';
import { Report } from '~blockml/interfaces/report';

export interface Viz extends common.FileBasic {
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

  reports?: Report[];
  reports_line_num?: number;
}
