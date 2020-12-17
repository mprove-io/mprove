import { api } from '../barrels/api';

export interface GenSqlProOutcome {
  sql: string[];
  filtersFractions: {
    [s: string]: api.Fraction[];
  };
}
