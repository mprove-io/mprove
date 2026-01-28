import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { Fraction } from '../fraction';
import { FileFraction } from './file-fraction';

export interface FieldFilter {
  hidden?: string; // boolean
  hidden_line_num?: number;

  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  result?: FieldResultEnum;
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

  //
  apiFractions?: Fraction[];

  filter?: string;

  name?: string;
  name_line_num?: number;
  fieldClass?: FieldClassEnum;
}
