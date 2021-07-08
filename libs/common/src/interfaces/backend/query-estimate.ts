import { IsInt, IsString } from 'class-validator';

export class QueryEstimate {
  @IsString()
  queryId: string;

  @IsInt()
  estimate: number;

  @IsString()
  lastRunDryTs: number;
}
