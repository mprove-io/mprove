import { IsInt, IsString } from 'class-validator';

export class Column {
  @IsInt()
  columnId: number;

  @IsInt()
  tsShifted: number;

  @IsString()
  label: string;
}
