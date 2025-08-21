import { FieldClassEnum } from '~common/enums/field-class.enum';

export interface FieldTime {
  hidden?: string; // boolean
  hidden_line_num?: number;

  group_label?: string;
  group_label_line_num?: number;

  group_description?: string;
  group_description_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: FieldClassEnum;
}
