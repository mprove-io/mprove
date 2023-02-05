import { IsString } from 'class-validator';

export class Rq {
  @IsString()
  fractionBrick: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;
}
