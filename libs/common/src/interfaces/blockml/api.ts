import { IsBoolean, IsString } from 'class-validator';

export class Api {
  @IsString()
  apiId: string;

  @IsString()
  filePath: string;

  @IsString()
  label: string;

  @IsBoolean()
  https: boolean;

  @IsString()
  host: string;

  headers: any[];

  steps: any[];
}
