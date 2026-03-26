import { IsInt, IsString } from 'class-validator';

export class MproveValidationErrorLine {
  @IsString()
  filePath: string;

  @IsString()
  fileName: string;

  @IsInt()
  lineNumber: number;
}
