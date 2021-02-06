import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { VarsSqlStep } from './vars-sql-step';

export interface GenSqlProOutcome {
  sql: string[];
  filtersFractions: {
    [s: string]: apiToBlockml.Fraction[];
  };
  varsSqlSteps: VarsSqlStep[];
}
