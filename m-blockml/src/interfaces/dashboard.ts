import { FileTopBasic } from './file-top-basic';
import { FieldExt } from './field-ext';
import { Report } from './report';

export interface Dashboard extends FileTopBasic {
  dashboard: string;
  dashboardLineNum: number;

  hidden: string; // boolean
  hiddenLineNum: number;

  title: string;
  titleLineNum: number;

  group: string;
  groupLineNum: number;

  description: string;
  descriptionLineNum: number;

  accessUsers: string[];
  accessUsersLineNum: number;

  fields: FieldExt[];
  fieldsLineNum: number;

  reports: Report[];
  reportsLineNum: number;
}
