import { IsInt, IsString } from 'class-validator';

export class Column {
  @IsInt()
  columnId: number;

  @IsString()
  label: string;
}
