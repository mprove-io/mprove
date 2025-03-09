import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Dashboard } from '../blockml/dashboard';
import { FilterX } from './filter-x';
import { ModelX } from './model-x';
import { TileX } from './tile-x';

export class DashboardX extends Dashboard {
  @ValidateNested()
  @Type(() => FilterX)
  extendedFilters: FilterX[];

  @ValidateNested()
  @Type(() => TileX)
  tiles: TileX[];

  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteDashboard: boolean;

  @ValidateNested()
  @Type(() => ModelX)
  storeModels: ModelX[];
}
