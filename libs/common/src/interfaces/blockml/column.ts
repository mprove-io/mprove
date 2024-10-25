import { IsInt, IsString } from 'class-validator';

export class Column {
  @IsInt()
  columnId: number;

  @IsInt()
  tsUTC: number;

  @IsString()
  label: string;
}
