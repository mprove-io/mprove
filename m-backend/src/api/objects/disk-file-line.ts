import { IsInt, IsString } from 'class-validator';

export class DiskFileLine {
  @IsString()
  fileId: string;

  @IsString()
  fileName: string;

  @IsInt()
  lineNumber: number;
}
