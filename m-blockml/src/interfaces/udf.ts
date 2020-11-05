import { TopBasic } from './top-basic';

export interface Udf extends TopBasic {
  sql: string;
  sqlLineNum: string;

  udf: string;
  udfLineNum: string;
}
