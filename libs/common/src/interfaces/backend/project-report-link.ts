import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProjectReportLink {
  @IsString()
  projectId: string;

  @IsString()
  reportId: string;

  @IsOptional()
  @IsInt()
  navTs: number;
}
