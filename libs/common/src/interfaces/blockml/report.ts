import { IsNumber, IsString } from 'class-validator';

export class Report {
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
  tileWidth: number;

  @IsNumber()
  tileHeight: number;

  @IsNumber()
  tileX: number;

  @IsNumber()
  tileY: number;
}
