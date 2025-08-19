import { FieldClassEnum } from '~common/enums/field-class.enum';
import { Fraction } from '../fraction';
import { FileStoreFractionControl } from './file-store-fraction-control';

export interface FieldStoreFilter {
  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  // result?: FieldResultEnum;
  // result_line_num?: number;

  max_fractions?: number;
  max_fractions_line_num?: number;

  required?: string; // boolean
  required_line_num?: number;

  fraction_controls?: FileStoreFractionControl[];
  fraction_controls_line_num?: number;

  //

  name?: string;
  name_line_num?: number;

  fieldClass?: FieldClassEnum;
  apiFractions?: Fraction[];
}
