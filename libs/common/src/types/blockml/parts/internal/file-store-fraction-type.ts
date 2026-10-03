import type { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import type { FileStoreFractionControl } from '#common/types/blockml/parts/internal/file-store-fraction-control';
import type { EnumValues } from '#common/types/enum-values';

export type FileStoreFractionType = {
  type?: string;
  type_line_num?: number;
  label?: string;
  label_line_num?: number;
  meta?: any;
  meta_line_num?: number;
  controls?: FileStoreFractionControl[];
  controls_line_num?: number;
  logicGroup?: EnumValues<typeof FractionLogicEnum>;
};
