import { IsNumber, IsOptional, IsString } from 'class-validator';

export class Tile {
  @IsString()
  modelId: string;

  @IsString()
  modelLabel: string;

  @IsString()
  modelFilePath: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  @IsString()
  trackChangeId: string;

  listen: { [a: string]: string };

  @IsOptional()
  @IsString({ each: true })
  deletedFilterFieldIds: string[];

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
