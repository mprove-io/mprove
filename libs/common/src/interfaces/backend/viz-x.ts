import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Viz } from '../blockml/viz';
import { TileX } from './tile-x';

export class VizX extends Viz {
  @ValidateNested()
  @Type(() => TileX)
  tiles: TileX[];

  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteViz: boolean;
}
