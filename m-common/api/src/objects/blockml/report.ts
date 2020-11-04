import { IsString } from 'class-validator';

export class Report {
  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;
}
