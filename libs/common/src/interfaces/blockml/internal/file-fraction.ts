import { enums } from '~common/barrels/enums';
import { FileFractionControl } from './file-fraction-control';

export interface FileFraction {
  logic?: enums.FractionLogicEnum;
  logic_line_num?: number;

  type?: string;
  type_line_num?: number;

  controls?: FileFractionControl[];
  controls_line_num?: number;
}
