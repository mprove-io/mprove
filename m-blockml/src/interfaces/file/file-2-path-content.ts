import { IsString } from 'class-validator';

export class File2PathContent {
  @IsString()
  path: string;

  @IsString()
  content: string;
}
