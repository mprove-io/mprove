import { IsString } from 'class-validator';

export class Report {
  @IsString()
  modelId: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;
}
