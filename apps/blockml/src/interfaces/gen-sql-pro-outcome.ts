import { common } from '~blockml/barrels/common';
import { VarsSqlStep } from './vars-sql-step';

export interface GenSqlProOutcome {
  sql: string[];
  filtersFractions: {
    [s: string]: common.Fraction[];
  };
  varsSqlSteps: VarsSqlStep[];
}
