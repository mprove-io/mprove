import { TopBasic } from './top-basic';

export interface Udf extends TopBasic {
  sql: string;
  sql_line_num: string;
  udf: string;
  udf_line_num: string;
}