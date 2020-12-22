import { enums } from 'src/barrels/enums';
import { VarsSub } from './vars-sub';

export interface VarsSubElement {
  func: enums.FuncEnum;
  varsSubInput: VarsSub;
  varsSubOutput: VarsSub;
}
