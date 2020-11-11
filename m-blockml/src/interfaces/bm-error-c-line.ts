import { IsInt, IsString } from 'class-validator';

export class BmErrorCLine {
  @IsInt()
  line: number;

  @IsString()
  name: string;

  @IsString()
  path: string;
}
