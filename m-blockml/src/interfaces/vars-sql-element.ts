import { enums } from '../barrels/enums';
import { VarsSql } from './vars-sql';

export interface VarsSqlElement {
  func: enums.FuncEnum;
  varsSqlInput: VarsSql;
  varsSqlOutput: VarsSql;
}
