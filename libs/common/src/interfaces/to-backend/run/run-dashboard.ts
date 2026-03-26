import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { RunTile } from '#common/interfaces/to-backend/run/run-tile';

export class RunDashboard {
  @IsString()
  title: string;

  @IsString()
  dashboardId: string;

  @IsString()
  url: string;

  @ValidateNested()
  @Type(() => RunTile)
  tiles: RunTile[];
}
