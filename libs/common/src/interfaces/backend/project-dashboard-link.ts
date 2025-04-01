import { IsBoolean, IsInt, IsString } from 'class-validator';

export class ProjectDashboardLink {
  @IsString()
  projectId: string;

  @IsString()
  dashboardId: string;

  @IsBoolean()
  draft: boolean;

  @IsInt()
  lastNavTs: number;
}
