import { enums } from '~common/barrels/enums';
import { VarsSql } from './vars-sql';

export interface VarsSqlStep {
  func: enums.FuncEnum;
  varsInput: VarsSql;
  varsOutput: VarsSql;
}
