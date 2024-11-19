import { Fraction } from '../fraction';
import { JoinAggregation } from '../join-aggregation';
import { VarsSqlStep } from './vars-sql-step';

export interface GenSqlProOutcome {
  sql: string[];
  filtersFractions: {
    [s: string]: Fraction[];
  };
  joinAggregations: JoinAggregation[];
  unsafeSelect: string[];
  varsSqlSteps: VarsSqlStep[];
}
