import { enums } from '~common/barrels/enums';
import { VarsSub } from './vars-sub';

export interface VarsSubStep {
  func: enums.FuncEnum;
  varsInput: VarsSub;
  varsOutput: VarsSub;
}
