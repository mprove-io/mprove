import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { FileFractionControl } from './file-fraction-control';

export interface FileFraction {
  logic?: FractionLogicEnum;
  logic_line_num?: number;

  type?: string;
  type_line_num?: number;

  controls?: FileFractionControl[];
  controls_line_num?: number;
}
