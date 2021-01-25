import { api } from '~/barrels/api';
import { VarsSqlStep } from './vars-sql-step';

export interface GenSqlProOutcome {
  sql: string[];
  filtersFractions: {
    [s: string]: api.Fraction[];
  };
  varsSqlSteps: VarsSqlStep[];
}
