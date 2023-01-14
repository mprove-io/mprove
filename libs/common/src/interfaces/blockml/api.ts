import { IsInt, IsString } from 'class-validator';

export class Api {
  @IsString()
  structId: string;

  @IsString()
  apiId: string;

  @IsString()
  filePath: string;

  @IsString()
  label: string;

  steps: any[];

  @IsInt()
  serverTs: number;
}
