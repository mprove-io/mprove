import { enums } from '../../barrels/enums';

export interface Field {
  hidden?: string; // boolean
  hidden_line_num?: number;

  description?: string;
  description_line_num?: number;

  sql?: string; // MyFilter uses it for fields deps check
  sql_line_num?: number; // MyFilter uses it for fields deps check

  //

  name: string;
  name_line_num: number;

  fieldClass: enums.FieldClassEnum;
  // fieldClass_line_num: number;

  sqlReal?: string;
}
