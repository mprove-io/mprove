import type { FieldClass } from '#common/types/blockml/parts/field/field-class';

export type FieldTime = {
  hidden?: string;
  hidden_line_num?: number;
  group_label?: string;
  group_label_line_num?: number;
  group_description?: string;
  group_description_line_num?: number;
  name?: string;
  name_line_num?: number;
  fieldClass?: FieldClass;
};
