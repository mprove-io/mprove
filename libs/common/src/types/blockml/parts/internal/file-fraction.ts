import type { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import type { FileFractionControl } from '#common/types/blockml/parts/internal/file-fraction-control';
import type { EnumValues } from '#common/types/enum-values';

export type FileFraction = {
  logic?: EnumValues<typeof FractionLogicEnum>;
  logic_line_num?: number;
  type?: string;
  type_line_num?: number;
  controls?: FileFractionControl[];
  controls_line_num?: number;
};
