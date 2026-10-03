import type { FieldResultEnum } from '#common/enums/field-result.enum';
import type { Fraction } from '#common/types/blockml/parts/fraction';
import type { FileFraction } from '#common/types/blockml/parts/internal/file-fraction';
import type { EnumValues } from '#common/types/enum-values';

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
  notStoreApplyToResult?: EnumValues<typeof FieldResultEnum>;
};
