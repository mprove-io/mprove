import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProjectDashboardLink {
  @IsString()
  projectId: string;

  @IsString()
  dashboardId: string;

  @IsOptional()
  @IsInt()
  navTs: number;
}
