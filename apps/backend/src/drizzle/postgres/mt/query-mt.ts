import { IsOptional, IsString } from 'class-validator';
import { QueryEnt } from '../schema/queries';

export interface QueryMt extends Omit<QueryEnt, 'st' | 'lt'> {
  st: QuerySt;
  lt: QueryLt;
}

export class QuerySt {
  @IsOptional()
  @IsString()
  sql: string;

  @IsOptional()
  @IsString()
  lastErrorMessage: string;

  @IsString()
  apiMethod: string;

  @IsString()
  apiUrl: string;

  @IsString()
  apiBody: string;
}

export class QueryLt {
  data: any;
}
