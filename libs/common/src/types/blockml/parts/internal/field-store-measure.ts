import type { FieldClass } from '#common/types/blockml/parts/field/field-class';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';

export type FieldStoreMeasure = {
  label?: string;
  label_line_num?: number;
  description?: string;
  description_line_num?: number;
  result?: FieldResult;
  result_line_num?: number;
  format_number?: string;
  format_number_line_num?: number;
  currency_prefix?: string;
  currency_prefix_line_num?: number;
  currency_suffix?: string;
  currency_suffix_line_num?: number;
  group?: string;
  group_line_num?: number;
  required?: string;
  required_line_num?: number;
  meta?: any;
  meta_line_num?: number;
  name?: string;
  name_line_num?: number;
  fieldClass?: FieldClass;
};
