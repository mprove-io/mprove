import { FieldResultEnum } from '~common/enums/field-result.enum';
import { Fraction } from '../fraction';
import { FileFraction } from './file-fraction';

export interface FileReportRowParameter {
  apply_to?: string;
  apply_to_line_num?: number;

  listen?: string;
  listen_line_num?: number;

  conditions?: string[];
  conditions_line_num?: number;

  fractions?: FileFraction[];
  fractions_line_num?: number;

  //

  apiFractions?: Fraction[];

  notStoreApplyToResult?: FieldResultEnum;
}
