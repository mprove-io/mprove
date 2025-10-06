import { IsOptional, IsString } from 'class-validator';

export class QueryTab {
  @IsOptional()
  @IsString()
  sql: string;

  @IsOptional()
  @IsString()
  lastErrorMessage: string;

  data: any;

  @IsString()
  apiMethod: string;

  @IsString()
  apiUrl: string;

  @IsString()
  apiBody: string;
}
