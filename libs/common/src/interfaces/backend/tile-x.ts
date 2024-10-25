import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Query } from '../blockml/query';
import { Tile } from '../blockml/tile';
import { MconfigX } from './mconfig-x';

export class TileX extends Tile {
  @IsOptional()
  @ValidateNested()
  @Type(() => MconfigX)
  mconfig?: MconfigX;

  @IsOptional()
  @ValidateNested()
  @Type(() => Query)
  query?: Query;

  @IsBoolean()
  hasAccessToModel: boolean;
}
