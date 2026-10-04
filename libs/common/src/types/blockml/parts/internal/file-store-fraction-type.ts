import type { FractionLogic } from '#common/types/blockml/parts/fraction/fraction-logic';

import type { FileStoreFractionControl } from '#common/types/blockml/parts/internal/file-store-fraction-control';

export type FileStoreFractionType = {
  type?: string;
  type_line_num?: number;
  label?: string;
  label_line_num?: number;
  meta?: any;
  meta_line_num?: number;
  controls?: FileStoreFractionControl[];
  controls_line_num?: number;
  logicGroup?: FractionLogic;
};
