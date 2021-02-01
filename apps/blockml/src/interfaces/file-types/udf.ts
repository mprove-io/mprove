import { FileBasic } from '~blockml/interfaces/file/file-basic';

export interface Udf extends FileBasic {
  sql?: string;
  sql_line_num?: string;

  udf?: string;
  udf_line_num?: string;
}
