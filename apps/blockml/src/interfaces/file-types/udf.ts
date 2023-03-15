import { common } from '~blockml/barrels/common';

export interface Udf extends common.FileBasic {
  sql?: string;
  sql_line_num?: string;

  udf?: string;
  udf_line_num?: string;
}
