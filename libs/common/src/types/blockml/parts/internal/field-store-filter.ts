import type { FieldClassEnum } from '#common/enums/field-class.enum';
import type { Fraction } from '#common/types/blockml/parts/fraction';
import type { FileStoreFractionControl } from '#common/types/blockml/parts/internal/file-store-fraction-control';
import type { EnumValues } from '#common/types/enum-values';

export type FieldStoreFilter = {
  label?: string;
  label_line_num?: number;
  description?: string;
  description_line_num?: number;
  max_fractions?: number;
  max_fractions_line_num?: number;
  required?: string;
  required_line_num?: number;
  fraction_controls?: FileStoreFractionControl[];
  fraction_controls_line_num?: number;
  name?: string;
  name_line_num?: number;
  fieldClass?: EnumValues<typeof FieldClassEnum>;
  apiFractions?: Fraction[];
};
