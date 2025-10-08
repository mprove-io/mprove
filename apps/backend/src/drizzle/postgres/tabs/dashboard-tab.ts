import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { DashboardField } from '~common/interfaces/blockml/dashboard-field';
import { Tile } from '~common/interfaces/blockml/tile';
import { DashboardEnt } from '../schema/dashboards';

export interface DashboardTab extends Omit<DashboardEnt, 'st' | 'lt'> {
  st: DashboardSt;
  lt: DashboardLt;
}

export class DashboardSt {
  @IsString()
  title: string;

  @IsString()
  filePath: string;

  @IsString({ each: true })
  accessRoles: string[];

  @ValidateNested()
  @Type(() => Tile)
  tiles: Tile[];

  @ValidateNested()
  @Type(() => DashboardField)
  fields: DashboardField[];
}

export class DashboardLt {
  content: any;
}
