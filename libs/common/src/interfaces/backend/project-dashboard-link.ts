import { IsInt, IsString } from 'class-validator';

export class ProjectDashboardLink {
  @IsString()
  projectId: string;

  @IsString()
  dashboardId: string;

  @IsInt()
  lastNavTs: number;
}
