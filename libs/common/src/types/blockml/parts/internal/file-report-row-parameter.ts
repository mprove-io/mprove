import type { FieldResult } from '#common/types/blockml/parts/field/field-result';

import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FileFraction } from '#common/types/blockml/parts/internal/file-fraction';

export type FileReportRowParameter = {
  apply_to?: string;
  apply_to_line_num?: number;
  listen?: string;
  listen_line_num?: number;
  conditions?: string[];
  conditions_line_num?: number;
  fractions?: FileFraction[];
  fractions_line_num?: number;
  apiFractions?: Fraction[];
  notStoreApplyToResult?: FieldResult;
};
