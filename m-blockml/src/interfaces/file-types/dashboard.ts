import { FileBasic } from '../file/file-basic';
import { FieldAny } from '../field/field-any';
import { Report } from '../report';

export interface Dashboard extends FileBasic {
  dashboard: string;
  dashboard_line_num: number;

  hidden: string; // boolean
  hidden_line_num: number;

  title: string;
  title_line_num: number;

  group: string;
  group_line_num: number;

  description: string;
  description_line_num: number;

  access_users: string[];
  access_users_line_num: number;

  fields: FieldAny[];
  fields_line_num: number;

  reports: Report[];
  reports_line_num: number;

  //

  filters: {
    [s: string]: string[];
  };
}
