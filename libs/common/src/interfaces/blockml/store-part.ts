import { IsString } from 'class-validator';

export class StorePart {
  @IsString()
  urlPath: string;

  @IsString()
  urlPathFunc: string;

  @IsString()
  urlPathFuncResult: string;

  @IsString()
  body: string;

  @IsString()
  bodyFunc: string;

  @IsString()
  bodyFuncResult: string;
}
