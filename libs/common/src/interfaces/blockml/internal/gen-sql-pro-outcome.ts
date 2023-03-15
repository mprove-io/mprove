import { Fraction } from '../fraction';
import { VarsSqlStep } from './vars-sql-step';

export interface GenSqlProOutcome {
  sql: string[];
  filtersFractions: {
    [s: string]: Fraction[];
  };
  varsSqlSteps: VarsSqlStep[];
}
