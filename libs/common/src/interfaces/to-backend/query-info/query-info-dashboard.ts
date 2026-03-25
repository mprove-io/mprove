import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { QueryInfoTile } from '#common/interfaces/to-backend/query-info/query-info-tile';

export class QueryInfoDashboard {
  @IsString()
  title: string;

  @IsString()
  dashboardId: string;

  @IsString()
  url: string;

  @ValidateNested()
  @Type(() => QueryInfoTile)
  tiles: QueryInfoTile[];
}
