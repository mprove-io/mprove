import { IsNumber, IsString } from 'class-validator';

export class Tile {
  @IsString()
  modelId: string;

  @IsString()
  modelLabel: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  listen: { [a: string]: string };

  @IsString()
  title: string;

  @IsNumber()
  plateWidth: number;

  @IsNumber()
  plateHeight: number;

  @IsNumber()
  plateX: number;

  @IsNumber()
  plateY: number;
}
