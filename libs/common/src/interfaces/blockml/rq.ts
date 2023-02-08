import { IsInt, IsOptional, IsString } from 'class-validator';

export class Rq {
  @IsString()
  fractionBrick: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  @IsOptional()
  @IsInt()
  lastCompleteTsCalculated: number;

  records: any[];
}
