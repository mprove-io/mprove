import { IsString } from 'class-validator';

export class PathContent {
  @IsString()
  path: string;

  @IsString()
  content: string;
}
