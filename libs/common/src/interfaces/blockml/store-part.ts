import { IsString } from 'class-validator';

export class StorePart {
  @IsString()
  urlPathFunc: string;

  @IsString()
  urlPathResult: string;

  @IsString()
  bodyFunc: string;

  @IsString()
  bodyResult: string;
}
