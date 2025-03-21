import { IsString } from 'class-validator';

export class StorePart {
  @IsString()
  reqTemplate: string;

  @IsString()
  reqFunction: string;

  @IsString()
  reqJsonParts: string;

  @IsString()
  reqBody: string;

  @IsString()
  reqUrlPath: string;
}
