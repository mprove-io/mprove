import { IsBoolean, IsString } from 'class-validator';

export class DashboardPartX {
  @IsString()
  structId: string;

  @IsString()
  dashboardId: string;

  @IsBoolean()
  draft: boolean;

  @IsString()
  creatorId: string;

  @IsString()
  title: string;

  @IsString()
  filePath: string;

  @IsString({ each: true })
  accessRoles: string[];

  //

  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteDashboard: boolean;
}
