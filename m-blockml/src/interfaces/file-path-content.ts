import { IsString } from 'class-validator';

export class FilePathContent {
  @IsString()
  path: string;

  @IsString()
  content: string;
}
