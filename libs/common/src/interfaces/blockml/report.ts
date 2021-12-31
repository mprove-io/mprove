import { IsNumber, IsOptional, IsString } from 'class-validator';

export class Report {
  @IsString()
  modelId: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  @IsOptional()
  @IsNumber()
  tileWidth: number;

  @IsOptional()
  @IsNumber()
  tileHeight: number;

  @IsOptional()
  @IsNumber()
  tileX: number;

  @IsOptional()
  @IsNumber()
  tileY: number;
}
