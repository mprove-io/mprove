import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Tile } from '~common/interfaces/blockml/tile';
import { ChartEnt } from '../schema/charts';

export interface ChartEnx extends Omit<ChartEnt, 'st' | 'lt'> {
  st: ChartSt;
  lt: ChartLt;
}

export class ChartSt {
  @IsString()
  title: string;

  @IsString()
  modelLabel: string;

  @IsString()
  filePath: string;

  @IsString({ each: true })
  accessRoles: string[];

  @ValidateNested()
  @Type(() => Tile)
  tiles: Tile[];
}

export class ChartLt {}
