import { FileTopBasic } from './file-top-basic';

export interface Udf extends FileTopBasic {
  sql: string;
  sql_line_num: string;

  udf: string;
  udf_line_num: string;
}
