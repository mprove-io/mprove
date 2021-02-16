import { IsInt, IsString } from 'class-validator';

export class QueryEstimate {
  @IsString()
  query_id: string;

  @IsInt()
  estimate: number;

  @IsInt()
  lastRunDryTs: number;
}
