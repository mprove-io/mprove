import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { DashboardField } from './dashboard-field';
import { Report } from './report';

export class Dashboard {
  @IsString()
  organizationId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  structId: string;

  @IsString()
  dashboardId: string;

  content: any;

  @IsString({ each: true })
  accessUsers: string[];

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  gr?: string;

  @IsBoolean()
  hidden: boolean;

  @ValidateNested()
  @Type(() => DashboardField)
  fields: DashboardField[];

  @ValidateNested()
  @Type(() => Report)
  reports: Report[];

  @IsBoolean()
  temp: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  serverTs: number;
}
