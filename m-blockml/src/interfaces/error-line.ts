import { IsInt, IsString } from 'class-validator';

export class ErrorLine {
  @IsInt()
  line: number;

  @IsString()
  name: string;

  @IsString()
  path: string;
}
