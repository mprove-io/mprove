import { IsInt, IsString } from 'class-validator';

export class FileLine {
  @IsString()
  fileId: string;

  @IsString()
  fileName: string;

  @IsInt()
  lineNumber: number;
}
