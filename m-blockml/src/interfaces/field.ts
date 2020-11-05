import { enums } from '../barrels/enums';

export interface Field {
  name: string;
  nameLineNum: number;

  fieldClass: enums.FieldClassEnum;
  fieldClassLineNum: number;

  hidden: string; // boolean
  hiddenLineNum: number;

  description: string;
  descriptionLineNum: number;

  sql: string; // MyFilter uses it for fields deps check
  sqlLineNum: number; // MyFilter uses it for fields deps check

  sqlReal: string;
}
