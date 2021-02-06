import { IsString } from 'class-validator';

export class File {
  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsString()
  content: string;
}
