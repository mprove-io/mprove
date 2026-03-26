import { IsString } from 'class-validator';

export class StateDashboardItem {
  @IsString()
  dashboardId: string;

  @IsString()
  url: string;
}
