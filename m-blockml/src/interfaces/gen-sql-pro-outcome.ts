import { api } from '../barrels/api';
import { VarsSqlElement } from './vars-sql-element';

export interface GenSqlProOutcome {
  sql: string[];
  filtersFractions: {
    [s: string]: api.Fraction[];
  };
  varsSqlElements: VarsSqlElement[];
}
