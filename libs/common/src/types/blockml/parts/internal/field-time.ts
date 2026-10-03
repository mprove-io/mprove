import type { FieldClassEnum } from '#common/enums/field-class.enum';
import type { EnumValues } from '#common/types/enum-values';

export type FieldTime = {
  hidden?: string;
  hidden_line_num?: number;
  group_label?: string;
  group_label_line_num?: number;
  group_description?: string;
  group_description_line_num?: number;
  name?: string;
  name_line_num?: number;
  fieldClass?: EnumValues<typeof FieldClassEnum>;
};
