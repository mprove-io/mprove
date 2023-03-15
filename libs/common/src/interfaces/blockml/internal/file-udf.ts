import { FileBasic } from './file-basic';

export interface FileUdf extends FileBasic {
  sql?: string;
  sql_line_num?: string;

  udf?: string;
  udf_line_num?: string;
}
