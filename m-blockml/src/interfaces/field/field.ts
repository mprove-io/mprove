import { enums } from '../../barrels/enums';

export interface Field {
  name: string;
  name_line_num: number;

  field_class: enums.FieldClassEnum;
  field_class_line_num: number;

  hidden: string; // boolean
  hidden_line_num: number;

  description: string;
  description_line_num: number;

  sql: string; // MyFilter uses it for fields deps check
  sql_line_num: number; // MyFilter uses it for fields deps check

  //

  sqlReal: string;
}
