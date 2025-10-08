import { QueryEnt } from '../schema/queries';

export interface QueryTab
  extends Omit<QueryEnt, 'st' | 'lt'>,
    QuerySt,
    QueryLt {}

export class QuerySt {
  sql: string;
  lastErrorMessage: string;
  apiMethod: string;
  apiUrl: string;
  apiBody: string;
}

export class QueryLt {
  data: any;
}
