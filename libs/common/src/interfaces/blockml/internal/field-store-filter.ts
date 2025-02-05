import { enums } from '~common/barrels/enums';
import { Fraction } from '../fraction';
import { FileStoreControl } from './file-store-control';

export interface FieldStoreFilter {
  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  // result?: enums.FieldResultEnum;
  // result_line_num?: number;

  max_fractions?: number;
  max_fractions_line_num?: number;

  show_if?: string; // boolean
  show_if_line_num?: number;

  required?: string; // boolean
  required_line_num?: number;

  fraction_controls?: FileStoreControl[];
  fraction_controls_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: enums.FieldClassEnum;

  fractions?: Fraction[];
}
