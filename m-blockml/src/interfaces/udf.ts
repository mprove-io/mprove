import { FileTopBasic } from './file-top-basic';

export interface Udf extends FileTopBasic {
  sql: string;
  sqlLineNum: string;

  udf: string;
  udfLineNum: string;
}
