import { FileBasic } from '../file/file-basic';
import { Report } from '../report';

export interface Visualization extends FileBasic {
  visualization?: string;
  visualization_line_num?: number;

  hidden?: string; // boolean
  hidden_line_num?: number;

  group?: string;
  group_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  report?: Report;
  report_line_num?: number;
}
