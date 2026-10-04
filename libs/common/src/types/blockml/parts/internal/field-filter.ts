import type { FieldClass } from '#common/types/blockml/parts/field/field-class';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';

import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FileFraction } from '#common/types/blockml/parts/internal/file-fraction';

export type FieldFilter = {
  hidden?: string;
  hidden_line_num?: number;
  label?: string;
  label_line_num?: number;
  description?: string;
  description_line_num?: number;
  result?: FieldResult;
  result_line_num?: number;
  store_model?: string;
  store_model_line_num?: number;
  store_result?: string;
  store_result_line_num?: number;
  store_filter?: string;
  store_filter_line_num?: number;
  suggest_model_dimension?: string;
  suggest_model_dimension_line_num?: number;
  conditions?: string[];
  conditions_line_num?: number;
  fractions?: FileFraction[];
  fractions_line_num?: number;
  apiFractions?: Fraction[];
  filter?: string;
  name?: string;
  name_line_num?: number;
  fieldClass?: FieldClass;
};
