import { IsString } from 'class-validator';

export class BmlFile {
  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsString()
  content: string;
}
