import type { FractionLogic } from '#common/types/blockml/parts/fraction/fraction-logic';

import type { FileFractionControl } from '#common/types/blockml/parts/internal/file-fraction-control';

export type FileFraction = {
  logic?: FractionLogic;
  logic_line_num?: number;
  type?: string;
  type_line_num?: number;
  controls?: FileFractionControl[];
  controls_line_num?: number;
};
