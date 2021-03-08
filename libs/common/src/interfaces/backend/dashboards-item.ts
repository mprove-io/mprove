import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DashboardsItem {
  @IsString()
  dashboardId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  gr?: string;

  @IsBoolean()
  hidden: boolean;
}
