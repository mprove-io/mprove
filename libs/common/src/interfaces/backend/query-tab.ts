import { IsString } from 'class-validator';

export class QueryTab {
  data: any;

  @IsString()
  apiMethod: string;

  @IsString()
  apiUrl: string;

  @IsString()
  apiBody: string;
}
